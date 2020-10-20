library(boastUtils)
library(boastWidgets)
library(shinyBS)

APP_TITLE <<- "boastWidgets"

# Define UI for app that draws a histogram ----
ui <- list(
  ## Create the app page
  dashboardPage(
    skin = "blue",
    ### Create the app header
    dashboardHeader(
      title = "boastWidgets", # You may use a shortened form of the title here
      tags$li(class = "dropdown", actionLink("info", icon("info"))),
      tags$li(class = "dropdown",
              tags$a(href='https://github.com/EducationShinyAppTeam/BOAST',
                     icon("github"))),
      tags$li(class = "dropdown",
              tags$a(href='https://shinyapps.science.psu.edu/',
                     icon("home")))
    ),
    ### Create the sidebar/left navigation menu
    dashboardSidebar(
      sidebarMenu(
        id = "pages",
        menuItem("Basic", tabName = "Basic", icon = icon("thermometer-quarter")),
        menuItem("Advanced", tabName = "Advanced", icon = icon("thermometer-three-quarters"))
      ),
      tags$div(
        class = "sidebar-logo",
        boastUtils::psu_eberly_logo("reversed")
      )
    ),
    ### Create the content
    dashboardBody(
      tabItems(
        #### Set up the Overview Page
        tabItem(
          tabName = "Basic",
          fluidRow(
            # Basic Examples
            # https://shiny.rstudio.com/tutorial/written-tutorial/lesson3/ 
            column(3,
                   h3("Buttons"),
                   bsButton(inputId = "action", label = "Action", style = "default"),
                   br(),
                   br(), 
                   submitButton("Submit")),
            
            column(3,
                   h3("Single checkbox"),
                   checkboxInput("checkbox", "Choice A", value = TRUE)),
            
            column(3, 
                   checkboxGroupInput("checkGroup", 
                                      h3("Checkbox group"), 
                                      choices = list("Choice 1" = 1, 
                                                     "Choice 2" = 2, 
                                                     "Choice 3" = 3),
                                      selected = 1)),
            
            column(3, 
                   dateInput("date", 
                             h3("Date input"), 
                             value = "2020-01-01"))   
          ),
          
          fluidRow(
            
            column(3,
                   dateRangeInput("dates", h3("Date range"))),
            
            column(3,
                   fileInput("file", h3("File input"))),
            
            column(3, 
                   h3("Help text"),
                   helpText("Note: help text isn't a true widget,", 
                            "but it provides an easy way to add text to",
                            "accompany other widgets.")),
            
            column(3, 
                   numericInput("num", 
                                h3("Numeric input"), 
                                value = 1))   
          ),
          
          fluidRow(
            
            column(3,
                   radioButtons("radio", h3("Radio buttons"),
                                choices = list("Choice 1" = 1, "Choice 2" = 2,
                                               "Choice 3" = 3),selected = 1)),
            
            column(3,
                   selectInput("select", h3("Select box"), 
                               choices = list("Choice 1" = 1, "Choice 2" = 2,
                                              "Choice 3" = 3), selected = 1)),
            
            column(3, 
                   sliderInput("slider1", h3("Sliders"),
                               min = 0, max = 100, value = 50),
                   sliderInput("slider2", "",
                               min = 0, max = 100, value = c(25, 75))
            ),
            
            column(3, 
                   textInput("text", h3("Text input"), 
                             value = "Enter text..."))   
          )
        ),
        tabItem(
          tabName = "Advanced",
          # Output: Poll
          fluidRow(
            column(9,
              h2("Radial Poll"),
              radialPollOutput("poll")
            )
          )
        )
      )
    )
  )
)

# Define server logic required to draw a histogram ----
server <- function(input, output, session) {
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
          angle = TRUE,
          theme = c(), # @todo: Add color palette options
          controls = TRUE
        )
      )
    )
  })
}

# Boast App Call ----
boastUtils::boastApp(ui = ui, server = server)
