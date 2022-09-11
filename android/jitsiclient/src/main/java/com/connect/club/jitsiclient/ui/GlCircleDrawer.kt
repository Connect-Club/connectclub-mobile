package com.connect.club.jitsiclient.ui

import android.content.res.Resources
import android.opengl.GLES11Ext
import android.opengl.GLES20
import android.opengl.GLES31
import org.webrtc.GlShader
import org.webrtc.GlUtil
import org.webrtc.RendererCommon.GlDrawer
import java.util.IdentityHashMap
import java.util.Locale

class GlCircleDrawer : GlDrawer {
    private class Shader(fragmentShader: String?) {
        val glShader: GlShader = GlShader(VERTEX_SHADER_STRING, fragmentShader)
        val texMatrixLocation: Int = glShader.getUniformLocation("texMatrix")
    }

    companion object {
        private val density = Resources.getSystem().displayMetrics.density

        // Сдвиг видео вправо вниз на 3 dp
        private val ds = String.format(Locale.US, "%f", density * 3f)

        // clang-format off
        // Simple vertex shader, used for both YUV and OES.
        private val VERTEX_SHADER_STRING = """varying vec2 interp_tc;
            attribute vec4 in_pos;
            attribute vec4 in_tc;
            
            uniform mat4 texMatrix;
            
            void main() {
                gl_Position = in_pos;
                interp_tc = (texMatrix * in_tc).xy;
            }
        """.trimIndent()

        private val YUV_FRAGMENT_SHADER_STRING = """
            precision mediump float;
            varying vec2 interp_tc;
            
            uniform sampler2D y_tex;
            uniform sampler2D u_tex;
            uniform sampler2D v_tex;
            uniform float texSize;
            //uniform float scaleFactor;
            
            float texelSize;
            void main() {
              texelSize = 1.0 / texSize;
              //vec2 coords = vec2(interp_tc.x, interp_tc.y);
              //vec2 coords = vec2(interp_tc.x, interp_tc.y + scaleFactor);
              vec2 coords = vec2(interp_tc.x - texelSize * 1.0, interp_tc.y + texelSize * 1.0);
              vec2 p = -1.0 + 2.0 * coords;
              float r = sqrt(dot(p,p));
              if (r <= 0.98) {
                float y = texture2D(y_tex, coords).r;
                float u = texture2D(u_tex, coords).r - 0.5;
                float v = texture2D(v_tex, coords).r - 0.5;
                gl_FragColor = vec4(
                    y + 1.403 * v, 
                    y - 0.344 * u - 0.714 * v, 
                    y + 1.77 * u, 1
                );
              } else {
                gl_FragColor = vec4(0,0,0,0);
              }
            }
        """.trimIndent()

        private const val RGB_FRAGMENT_SHADER_STRING = ("precision mediump float;\n"
            + "varying vec2 interp_tc;\n"
            + "\n"
            + "uniform sampler2D rgb_tex;\n"
            + "\n"
            + "void main() {\n"
            + "  vec2 p = -1.0 + 2.0 * interp_tc.xy;\n"
            + "  float r = sqrt(dot(p,p));\n"
            + "  gl_FragColor = ( (r < 1.0) ? texture2D(rgb_tex, interp_tc) : vec4(0,0,0,0));\n"
            + "}\n;")

        private const val OES_FRAGMENT_SHADER_STRING = ("#extension GL_OES_EGL_image_external : require\n"
            + "precision mediump float;\n"
            + "varying vec2 interp_tc;\n"
            + "\n"
            + "uniform samplerExternalOES oes_tex;\n"
            + "\n"
            + "void main() {\n"
            + "  vec2 p = -1.0 + 2.0 * interp_tc.xy;\n"
            + "  float r = sqrt(dot(p,p));\n"
            + "  gl_FragColor = ( (r < 1.0) ? texture2D(oes_tex, interp_tc) : vec4(0,0,0,0));\n"
            + "}\n")

        // clang-format on
        // Vertex coordinates in Normalized Device Coordinates, i.e. (-1, -1) is bottom-left and (1, 1) is
        // top-right.
        private val FULL_RECTANGLE_BUF = GlUtil.createFloatBuffer(floatArrayOf(
            -1.0f, -1.0f,  // Bottom left.
            1.0f, -1.0f,  // Bottom right.
            -1.0f, 1.0f,  // Top left.
            1.0f, 1.0f))

        // Texture coordinates - (0, 0) is bottom-left and (1, 1) is top-right.
        private val FULL_RECTANGLE_TEX_BUF = GlUtil.createFloatBuffer(floatArrayOf(
            0.0f, 0.0f,  // Bottom left.
            1.0f, 0.0f,  // Bottom right.
            0.0f, 1.0f,  // Top left.
            1.0f, 1.0f // Top right.
        ))
    }

    // The keys are one of the fragments shaders above.
    private val shaders: MutableMap<String, Shader> = IdentityHashMap()

    /**
     * Draw an OES texture frame with specified texture transformation matrix. Required resources are
     * allocated at the first call to this function.
     */
    override fun drawOes(
        oesTextureId: Int, texMatrix: FloatArray, frameWidth: Int, frameHeight: Int,
        viewportX: Int, viewportY: Int, viewportWidth: Int, viewportHeight: Int,
    ) {
        prepareShader(OES_FRAGMENT_SHADER_STRING, texMatrix)
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        // updateTexImage() may be called from another thread in another EGL context, so we need to
        // bind/unbind the texture in each draw call so that GLES understads it's a new texture.
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, oesTextureId)
        drawRectangle(viewportX, viewportY, viewportWidth, viewportHeight)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, 0)
    }

    /**
     * Draw a RGB(A) texture frame with specified texture transformation matrix. Required resources
     * are allocated at the first call to this function.
     */
    override fun drawRgb(
        textureId: Int, texMatrix: FloatArray, frameWidth: Int, frameHeight: Int,
        viewportX: Int, viewportY: Int, viewportWidth: Int, viewportHeight: Int,
    ) {
        prepareShader(RGB_FRAGMENT_SHADER_STRING, texMatrix)
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textureId)
        drawRectangle(viewportX, viewportY, viewportWidth, viewportHeight)
        // Unbind the texture as a precaution.
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, 0)
    }

    /**
     * Draw a YUV frame with specified texture transformation matrix. Required resources are
     * allocated at the first call to this function.
     */
    override fun drawYuv(
        yuvTextures: IntArray, texMatrix: FloatArray, frameWidth: Int, frameHeight: Int,
        viewportX: Int, viewportY: Int, viewportWidth: Int, viewportHeight: Int,
    ) {
        prepareShader(YUV_FRAGMENT_SHADER_STRING, texMatrix)
        // Bind the textures.
        for (i in 0..2) {
            GLES20.glActiveTexture(GLES20.GL_TEXTURE0 + i)
            GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, yuvTextures[i])
        }
        drawRectangle(viewportX, viewportY, viewportWidth, viewportHeight)
        // Unbind the textures as a precaution..
        for (i in 0..2) {
            GLES20.glActiveTexture(GLES20.GL_TEXTURE0 + i)
            GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, 0)
        }
    }

    /**
     * Release all GLES resources. This needs to be done manually, otherwise the resources are leaked.
     */
    override fun release() {
        for (shader in shaders.values) {
            shader.glShader.release()
        }
        shaders.clear()
    }

    private fun drawRectangle(x: Int, y: Int, width: Int, height: Int) {
        // Draw quad.
        GLES20.glViewport(x, y, width, height)
        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
    }

    private fun prepareShader(fragmentShader: String, texMatrix: FloatArray) {
        val shader: Shader?
        if (shaders.containsKey(fragmentShader)) {
            shader = shaders[fragmentShader]
        } else {
            // Lazy allocation.
            shader = Shader(fragmentShader)
            shaders[fragmentShader] = shader
            shader.glShader.useProgram()
            // Initialize fragment shader uniform values.
            when {
                YUV_FRAGMENT_SHADER_STRING == fragmentShader -> {
                    GLES20.glUniform1i(shader.glShader.getUniformLocation("y_tex"), 0)
                    GLES20.glUniform1i(shader.glShader.getUniformLocation("u_tex"), 1)
                    GLES20.glUniform1i(shader.glShader.getUniformLocation("v_tex"), 2)
                    defineTexSize(shader)
                    // GLES20.glUniform1f(shader.glShader.getUniformLocation("scaleFactor"), scaleFactor)
                }
                RGB_FRAGMENT_SHADER_STRING == fragmentShader -> {
                    GLES20.glUniform1i(shader.glShader.getUniformLocation("rgb_tex"), 0)
                }
                OES_FRAGMENT_SHADER_STRING == fragmentShader -> {
                    GLES20.glUniform1i(shader.glShader.getUniformLocation("oes_tex"), 0)
                }
                else -> {
                    throw IllegalStateException("Unknown fragment shader: $fragmentShader")
                }
            }
            GlUtil.checkNoGLES2Error("Initialize fragment shader uniform values.")
            // Initialize vertex shader attributes.
            shader.glShader.setVertexAttribArray("in_pos", 2, FULL_RECTANGLE_BUF)
            shader.glShader.setVertexAttribArray("in_tc", 2, FULL_RECTANGLE_TEX_BUF)
        }
        shader!!.glShader.useProgram()
        // scaleMatrix(texMatrix)
        // Copy the texture transformation matrix over.
        GLES20.glUniformMatrix4fv(shader.texMatrixLocation, 1, false, texMatrix, 0)
    }

    private fun defineTexSize(shader: Shader) {
        val texDims = IntArray(1)
        GLES31.glGetTexLevelParameteriv(GLES31.GL_TEXTURE_2D, 0, GLES31.GL_TEXTURE_WIDTH, texDims, 0)
        GLES20.glUniform1f(shader.glShader.getUniformLocation("texSize"), texDims[0] / density)
    }

    // private fun scaleMatrix(matrix: FloatArray) {
    //     val scaleVar = 1f + scaleFactor
    //     Matrix.scaleM(matrix, 0, scaleVar, scaleVar, scaleVar)
    // }
}
