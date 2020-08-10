#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
gaugedResponse <- function(message, width = NULL, height = NULL, elementId = NULL) {

  # forward options using x
  x = list(
    data = message
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'gaugedResponse',
    x,
    width = width,
    height = height,
    package = 'boastWidgets',
    elementId = elementId
  )
}

#' Shiny bindings for gaugedResponse
#'
#' Output and render functions for using gaugedResponse within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a gaugedResponse
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name gaugedResponse-shiny
#'
#' @export
gaugedResponseOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'gaugedResponse', width, height, package = 'boastWidgets')
}

#' @rdname gaugedResponse-shiny
#' @export
renderGaugedResponse <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, gaugedResponseOutput, env, quoted = TRUE)
}
