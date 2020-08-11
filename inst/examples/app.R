library(boastWidgets)

# Define UI for app that draws a histogram ----
ui <- fluidPage(

  # App title ----
  titlePanel("Hello Shiny!"),

  # Sidebar layout with input and output definitions ----
  sidebarLayout(

    # Sidebar panel for inputs ----
    sidebarPanel(

    ),

    # Main panel for displaying outputs ----
    mainPanel(

      # Output: Poll
      radialPollOutput("poll")
    )
  )
)

# Define server logic required to draw a histogram ----
server <- function(input, output) {
  data <- jsonlite::read_json('./sample-data.json')

  output$poll <- renderRadialPoll({
    radialPoll(
      data = data,
      options = list(
        choices = c(
          "Apples",
          "Bananas",
          "Carrots",
          "Durian",
          "Eggplant",
          "Fig",
          "Grapes",
          "Honeydew"
        ),
        display = list(
          angles = FALSE,
          theme = c(), # @todo: Add color palette options
          legend = FALSE
        )
      )
    )
  })
}

shinyApp(ui, server)
