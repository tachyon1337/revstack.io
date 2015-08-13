# revstack.io dashboard app

Installs a default revstack.io dashboard app with mocked data.

# Installation


##prerequisites

``` bash

node
gulp
bower

```


#clone repo

``` bash

git clone https://github.com/tachyon1337/revstack.io.git
mv ./revstack.io  my-project
cd my-project

```


#npm

``` bash

npm install
gulp init
bower install

```


#tasks

``` bash

gulp start [launches web site and script/sass auto compilation]

```

# Browser

``` bash

localhost:8080

```

## Additional Tasks

``` bash

gulp start-live [live reload]
localhost:9040

gulp sass [manual compilation]
gulp sass-watch [auto compilation on changes]

```

## CLI

``` bash

node-sass app.scss ./public/css/app.css


```






