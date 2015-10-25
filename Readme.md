# prerequesties

In case installation from scratch, we need a lot of packages.

First of all, install node.js from https://nodejs.org/

Then, Gulp and Bower package managers:

    npm install -g gulp-cli
    npm install -g bower

For the functional testing need to install the galenframework globally:

    npm install -g galenframework-cli

In order to run the Gemini tests:

    npm install -g selenium-standalone
    selenium-standalone install
    selenium-standalone start

# installation 

Run from the package root dir:

    npm install
    bower install

# output directories
dev version root:

    ./dev/

dist version root:

    ../webapp/static/

# build and run dev server (results in ./dev directory)

Run from package root dir

    gulp serve
    # dev pages will be served as http://localhost:3000/letters
    # includes automatic rebuild on changes with 'livereload' feature

# build dev assets

    gulp build:dev

# build optimized dist assets (results in ../webapp/static directory)

    gulp build:dist

# build non-optimized dist assets (results in ../webapp/static directory)

    gulp build:dev --dist

# serve dist assets

    gulp serve:dist

# run layout tests  

    gulp serve
    # in another terminal
    gulp galen
    # reports root is \test\galen\reports\letters.test\report.html  


# Sublime notes

In case you've got time to time mysterious gulp file access errors, the cause may be in Sublime's write file locks.
You can fix it by setting next value in the Sublime configuration:

{
  "atomic_save": true,
  ...
}

To unify code style (tabs/spaces, parentheses style, etc..), Sublime can use the .editorconfig configuration, just need to install https://github.com/sindresorhus/editorconfig-sublime plugin

# gemini notes

To install gemini worldwide on os-x and linix, use

    sudo npm install --unsafe-perm -g gemini
    