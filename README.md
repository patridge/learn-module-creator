# Microsoft Learn module creator

A Visual Studio Code extension for creating the initial structure for your new Microsoft Learn modules.

## Install the Generator

From the Extensions side bar in Visual Studio Code, find the **Microsoft Learn module creator** (id: learn-module-creator) extension and install it. Reload VS Code when it completes.

## Run yo generator-learn-module

The Microsoft Learn module creator will walk you through the steps required to create your module, prompting for values used to generate the initial structure.

To start creating a module, run the **Generate a Microsoft Learn module** command from the command palette (**Cmd**+**Shift**+**P**).

## Generator Output

This extension will create a base folder structure of YAML and Markdown content, with the `{your-module-id}` value derived from the module title you provide.

* ./{your-module-id}/
  * index.yml
  * 1-introduction.yml
  * 6-summary.yml
  * /includes/
    * 1-introduction<span/>.md
    * 6-summary<span/>.md

While you will want a module summary, do not feel obliged to keep it as the sixth unit in your module. Just remember to renumber the YAML and Markdown files as well as the ID in the index.yml and the 6-summary.yml files, if you do.

## History

* 0.1.0: Generates the basic scaffolding for a new Microsoft Learn module.

## License

[MIT](https://github.com/patridge/learn-module-creator/blob/master/LICENSE)
