import ImagePicker from 'react-native-image-crop-picker'
import {ms} from 'react-native-size-matters'

const cameraUtils = {
  pickImageFromLibrary: async (): Promise<string | null> => {
    try {
      const images = await ImagePicker.openPicker({
        width: ms(300),
        height: ms(300),
        cropping: true,
        multiple: false,
        cropperCircleOverlay: true,
        maxFiles: 1,
      })
      if (!images) return null
      if (!images.path) return null
      return images.path
    } catch (e) {
      //cancelled
      return null
    }
  },
  takePhotoFromCamera: async (): Promise<string | null> => {
    try {
      let image = await ImagePicker.openCamera({
        width: ms(500),
        height: ms(500),
        cropping: true,
        cropperCircleOverlay: true,
      })
      return image.path ? image.path : null
    } catch (e) {
      return null
    }
  },
}

export default cameraUtils
