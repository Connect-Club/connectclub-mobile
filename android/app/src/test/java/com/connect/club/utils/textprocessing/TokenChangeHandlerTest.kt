package com.connect.club.utils.textprocessing

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import java.util.stream.Stream

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class TokenChangeHandlerTest {

    lateinit var parser: TextEditorParser

    @BeforeEach
    fun setUp() {
        parser = TextEditorParser()
    }

    @ParameterizedTest
    @MethodSource("provideDataSet")
    fun `test text changes`(source: String, expected: String, params: Params) {
        val tokens = parser.parse(source).toMutableList()
        val changes = getChangeRange(tokens, params)

        val updatedTokens = TokenChangeHandler.handleChanges(
            tokens,
            changes,
            expected,
            params.start,
            params.count,
            params.after
        )
        tokens.subList(changes.first, changes.last + 1).toList().forEach {
            tokens.remove(it)
        }
        tokens.addAll(changes.first, updatedTokens)

        val text = tokens.joinToString(separator = "") { it.text }

        assertThat(text).isEqualTo(expected)
    }

    private fun getChangeRange(tokens: List<ParseToken>, params: Params): IntRange {
        val changes = tokens.indices.filter {
            TokenChangeDetect.isChanged(tokens, it, params.start, params.count, params.after)
        }
        return changes.minOrNull()!!..changes.maxOrNull()!!
    }

    @Suppress("unused")
    private fun provideDataSet(): Stream<Arguments> {
        return Stream.of(
            Arguments.of(
                "Test",
                "Tes",
                Params(4, 4, 3)
            ),
            Arguments.of(
                "Tes",
                "Test",
                Params(3, 3, 4)
            ),
            Arguments.of(
                "Remove",
                "",
                Params(0, 6, 0),
            ),
            Arguments.of(
                "Remove word",
                "Remove ",
                Params(7, 4, 0),
            ),
            Arguments.of(
                "Add",
                "Add word",
                Params(3, 0, 5),
            ),
            Arguments.of(
                "Add",
                "left Add",
                Params(0, 0, 5),
            ),
            Arguments.of(
                "Add",
                "Add right",
                Params(3, 0, 6),
            ),
            Arguments.of(
                "[Add](https://google.com)",
                "left Add",
                Params(0, 0, 5),
            ),
            Arguments.of(
                "[Add](https://google.com)",
                "Add right",
                Params(3, 0, 6),
            ),
            Arguments.of(
                "Test remove [link](https://google.com) char",
                "Test remove lin char",
                Params(12, 4, 3),
            ),
            Arguments.of(
                "Test remove [link](https://google.com) char",
                "Test remove ink char",
                Params(12, 1, 0),
            ),
            Arguments.of(
                "[Aaa](https://google.com) ccc",
                "Aaaa ccc",
                Params(0, 3, 4),
            ),
            Arguments.of(
                "[Aaaa](https://google.com) ccc",
                "Aaa ccc",
                Params(0, 4, 3),
            ),
            Arguments.of(
                "Add char [link](https://google.com) [url](https://google.com)",
                "Add char linkx url",
                Params(10, 4, 5),
            ),
            Arguments.of(
                "[Quick](https://google.com) brown [fox](https://google.com)",
                "Quickbrownfox",
                Params(5, 7, 5),
            ),
        )
    }

    data class Params(val start: Int, val count: Int, val after: Int)
}