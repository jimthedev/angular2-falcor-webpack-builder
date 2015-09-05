# angular2-webpack-falcor-builder

Builds a bleeding edge example app featuring angular2+falcor.

## About

This project is really just a build script that runs some commands and patches in some files over top of [angular2-webpack-starter](https://github.com/angular-class/angular2-webpack-starter). The result is a very basic Angular2 + Falcor + Falcor-Express app. 

Currently, all data persistence (storage) in the app's backend is mocked which is why we don't have a working example of using falcor's model set or call. This may change in future versions of this project.

![Alt text](/../screenshots/screenshot.png?raw=true "Screenshot")

## Usage

### Clone the project

```
git clone https://github.com/jimthedev/angular2-falcor-webpack-builder.git
```

### Build

```
cd angular2-webpack-falcor-builder
./setup.sh
```

This build script will execute a series of commands, copy some files, and spit out a project to n2f-build.

### Run the app

```
(cd n2f-build && npm run falcor)
```

You can then see the app at `http://localhost:3000`.

## Credit

Thanks to PatrickJS, Angular Class, the Falcor and Angular teams.