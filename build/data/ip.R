library(tidyverse)
library(jsonlite)
library(readxl)

col_names <- c("affid","cbsa","name",
               "shlo17","shlomid17","shmid17","shupmid17","shup17","blank1",
               "brklomid17","brkmid17","brkupmid17","brkup17","blank2",
               "shlo00","shlomid00","shmid00","shupmid00","shup00","blank3",
               "brklomid00","brkmid00","brkupmid00","brkup00")

data <- read_xlsx("/home/alec/Projects/Brookings/middle-class-in-metros/build/data/2017 metro middle class charts.xlsx", 
                   sheet="data for interactive", skip=2, col_names = col_names )

data %>% summarise_at(c("shlo17","shlomid17","shmid17","shupmid17","shup17"), max)


json <- data %>% as.data.frame() %>% 
                 split(.$cbsa) %>% 
                 lapply(function(d){
                    sh17 <- d %>% select(lo=shlo17, lomid=shlomid17, mid=shmid17, upmid=shupmid17, up=shup17) %>% unbox()
                    thresh17 <- d %>% select(lomid=brklomid17, mid=brkmid17, upmid=brkupmid17, up=brkup17) %>% unbox()
                    sh00 <- d %>% select(lo=shlo00, lomid=shlomid00, mid=shmid00, upmid=shupmid00, up=shup00) %>% unbox()
                    thresh00 <- d %>% select(lomid=brklomid00, mid=brkmid00, upmid=brkupmid00, up=brkup00) %>% unbox()
                    geo <- d %>% select(cbsa, name) %>% unbox()
                    return(list(geo=geo, shares=list(y17=sh17, y00=sh00), thresholds=list(y17=thresh17, y00=thresh00)))
                 }) %>%
                 toJSON(digits=5, na="null")

writeLines(c("var data = ", json, ";", "export default data;"), con="/home/alec/Projects/Brookings/middle-class-in-metros/build/js/data.js")

names(data)

gg <- ggplot(data=data)
gg + geom_point(aes(x=shup17, y=shlo17, color=shlomid17+shmid17+shupmid17), alpha=0.7) + facet_wrap("cut17", nrow=2)