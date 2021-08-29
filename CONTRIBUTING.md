# Contributing

First of all, thanks for wanting to contribute to Papercut. The project is fairly small so there is no structure defined. Pull requests are very welcome, with or without the existance of an issue. Issues are very welcome as well as long as descriptive enough.

## Getting code merged

Please open a PR if you want to get some code in the main branch. It will be reviewed and merged eventually, in case we think it's ok.

## How do I make changes to this repository?

Papercut being a library means that you need to follow certain conventions, mainly when writing commit messages. Please get yourself familiarized with Conventional Commits (https://www.conventionalcommits.org/en/v1.0.0/). You'll never bump a version by hand when making changes to papercut, but `semantic-release` will during the CI pipeline based on the commit message, according to the Conventional Commits spec.

## Development environment 

You need node. How you make it available in your environment is up to you _(maybe you're into using docker containers for dev environments, for example)_.

### Running Tests

To run tests, run the following command

```bash
  yarn test
```

### Run Locally

Clone the project

```bash
  git clone https://github.com/armand1m/papercut
```

Go to the project directory

```bash
  cd papercut
```

Install dependencies

```bash
  yarn
```

After that, feel free to update the `examples` folder to test your changes.

Hopefully in the future, this will include a test runner a well to make the development experience a bit more reliable and enjoyable.

### Examples

The examples folder are just node projects as well with their own dependencies. They have `@armand1m/papercut` as a dependency, but linked to your local file system build.

This means you _need_ to have a build of papercut locally. Just run `yarn build` in the root and you should be fine.

Once that is done, you can proceed to actually running the example.

The examples have their own `README.md` with instructions on how to run them.


