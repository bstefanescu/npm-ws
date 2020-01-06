# [Qute](https://qutejs.org) monorepo builder.

Qub is a monorepo package manager for [npm](https://npmjs.org).

You can use it to easily build, test and publish your monorepo javascript project that contains multiple interdependent npm packages inside a single source repository.

Qub was initially designated to manage the development life cycle of [Qute](https://qutejs.org).

## Features

* Provides basic tasks for npm package development like `build`, `test`, `publish`, `version` etc.
* Extensible task registry: you can define simple tasks directly in the root `package.json` or more complex tasks using javascript files.
* Can easily be integrate with any javascript bundler and tester.
* Built-in integration with [rollup](https://rollupjs.org) and [mocha](https://mochajs.org)
* Integrated development server (with live reload support over multiple dependent packages)

## Usage

To install:

```
npm install -g qub
```

Then add a `build` entry in your `package.json` to define your repository layout, custom tasks and other build configuration.

The root package of a monorepo product is not publishable (you must use `private: true` in your root package.json). The root package only serves as a container for publishable packages.

The root package is the **workspace**. An workspace can contain one or more npm packages (or **projects**). A workspace is respnsible to run tasks on its projects.

Tasks are of two types:
1. global tasks - which runs at workspace level. Example: `help`, `projects` etc.
2. project tasks - which are run on each project respecting the dependency order between projects (i.e. projects required by another project will be processed first).


**Syntax:**

```
qub [project] [task] [task arguments ...]
```

**Arguments:**

1. **project** -  an optional package name. For scoped packages you can use the local name too.
    When specified the task will run only on that project. Otherwise the task is run on all the workspace projects.
2. **task** - an optional task. If not specified the `help` task will be run.
3. All the other arguments will be passed to the task as arguments.

When running `qub` inside a project directory it will run the tasks only on that project (as if the project argument was given)

## Tasks

Not all the build configuration and tasks are documented. To see an example of how to configure a workspace look into the root package.json of [Qute](https://github.com/bstefanescu/qutejs);

More documentation is comming soon.

### install

Install the workspace (and contained projects) dependencies.
Dependency projects will be linked in the `node_modules` directory of the dependent project.

You must use this command to initialize the dependencies and **not** `npm install`.

```
qub install
```

### uninstall

Remove all generated `node_modules` directories

```
qub uninstall
```

### shell

Run a shell command against all the projects.

**Example:**

```
qub shell ls -1
```

will list the content of each project

```
qub subproject shell ls -1
```

will list the content of the given `subproject`

### build

Run the build (against all projects). This task requires some additional configuration. If you are using rollup as the bundler - you only need to specify a rollup config file (or one per project type). If you don't use rollup then you need to write a script to integrate the bundler.

```
qub build
```

### test

Run the tests (against all projects). This task requires some additional configuration. By default mocha will be used as the tester. If you want to use another tester then you need to write an integration script.

```
qub test
```

### run

Run a set of tasks against all projects.

Each task will be run on each of the workspace projects. After a task completes then the next task is run on each of the workspace projects.

**Example:**

```
qub run build test
```

To specify arguments for a task in the run list use quotes or double quotes:

```
qub run "build prod" test
```

### version

Update version of all projects (including workspace package.json) to the given version.

```
qub version 'version'
```
where version is:

1. an explicit version. Example: `1.1.0`.
2. the string 'major'
2. the string 'minor'
2. the string 'patch'

### publish

Publish all publishable projects.

The arguments passed to publish task are passed down to `npm publish`.

**Example:**

```
qub publish --dry-run
```

### start

Start the development server. Usually used in conjunction with `watch`.

**Example:**

```
qub start
```
### watch

Watch for file changes and rebuild. Usually used in conjunction with `start`

**Example:**

```
qub run "build dev" watch start
```

### projects

List the projects in the workspace

```
qub projects
```

### help

Display the help screen.s

```
qub help
```

### link

Link dependent projects

```
qub link
```

### unlink

Remove dependent project links

```
qub unlink
```

### rm

Remove files (with glob support). Usually called from another tasks (like clean)


## License

[MIT](LICENSE)

## Authors

**[Bogdan Stefanescu](mailto:bogdan@quandora.com)** - *Intial Work* - [Quandora](https://quandora.com)
