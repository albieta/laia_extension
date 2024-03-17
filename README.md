# LAIA VS Code Extension

The LAIA VS Code Extension facilitates interaction with the LAIA assistant by providing a chat interface. Users can engage in descriptive conversations with LAIA, and based on the interaction, the extension automatically generates both backend and frontend projects.

*Please note that LAIA is currently under development.*

## Installation

```
vsce package
code --install-extension laiaextension-X.X.X.vsix
```

## Usage

Open an empty folder/project on VS code, open the VS Code "Command Palette" and type `>Laia Chat :)`
Click on `START LAIA` to generate the project.
Modify the config.yaml to set an openai api_key to get started.

## Prerequisites

* `Flutter 3.16.5, Dart 3.2.3`
* `Python`
* `MongoDB`

## Related Projects

* LAIA - [laia-gen-lib](https://github.com/albieta/LAIA)
* LAIA Flutter Code Generator - [laia-flutter-gen](https://github.com/albieta/laia_flutter_gen)