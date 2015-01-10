# Pyro Platform

Pyro is a platform that teaches programming through the hands on experience of building an app. [Pyro Platform](http://pyrolabs.io) is the front end that allows users to access this functionality without needing to understand setting up a development environment.


The [Pyro Library](https://github.com/pyrolabs/PyroLibrary) is available for use both within Pyro Platform as well as separately as a standalone javascript library.

## Pyro Project Planning

### Current Functionality

* **Editor** - Directly edit your apps code within the browser without the need to save
* **Tester** - See the changes you have made to your app

### Future Functionality
* Pyro Push - Push notifications based on firebase data events
* Pyro Integrations - Custom plugin interface

### Dependencies
* [Ionic Framework](http://ionicframework.com)
* [Angularjs](http://angularjs.org)
* [ui-router](http://angular-ui.github.io/ui-router/site/#/api/ui.router) -- [Docs](https://github.com/angular-ui/ui-router/wiki)

### Grunt Plugins
#### Current
* [grunt-contrib-uglify](https://github.com/gruntjs/grunt-contrib-uglify) -- Minification and closuring
* [grunt-bump](https://github.com/vojtajina/grunt-bump) - Version bumping/tagging/commiting
* [grunt-contrib-copy](https://github.com/gruntjs/grunt-contrib-copy) - Copy files from dev folder to dist folder for production
* [grunt-contrib-htmlmin](https://github.com/gruntjs/grunt-contrib-htmlmin) - Minify html files

#### Planned
* [grunt-contrib-concat](https://github.com/gruntjs/grunt-contrib-concat) - Combine all files
* [grunt-contrib-jshint](https://github.com/gruntjs/grunt-contrib-jshint) - Validate javascript files with JSHint
* [grunt-html2js](https://github.com/karlgoldstein/grunt-html2js) - Convert html files to javascript to avoid Angulars lazy loading
* [grunt-contrib-clean](https://github.com/gruntjs/grunt-contrib-clean) - Delete files and folders from a location
* [grunt-bower-task](https://github.com/yatskevich/grunt-bower-task) - Access bower actions through grunt
* [grunt-karma](https://github.com/karma-runner/grunt-karma) - Run tests written in jasmine
