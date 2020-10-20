#' radialPoll
#'
#' @import htmlwidgets
#'
#' @export
radialPoll <- function(data, options = NULL, width = NULL, height = NULL, elementId = NULL) {

  if(!is.null(options)) {
    if(length(options$choices) < 2) {
      warning("Please provide at least two choices as options$choices.")
    } else if(length(options$choices) > 10) {
      warning("Consider limiting your list of choices to 10 or fewer.")
    }
  }

  x <- list(
    data = data,
    options = options
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'radialPoll',
    x,
    width = width,
    height = height,
    package = 'boastWidgets',
    elementId = elementId
  )
}

#' Shiny bindings for radialPoll
#'
#' Output and render functions for using radialPoll within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a radialPoll
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name radialPoll-shiny
#'
#' @export
radialPollOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'radialPoll', width, height, package = 'boastWidgets')
}

#' @rdname radialPoll-shiny
#' @export
renderRadialPoll <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, radialPollOutput, env, quoted = TRUE)
}
