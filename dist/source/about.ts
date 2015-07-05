import pagedown from 'pagedown';

export class About {
	protected content: String = pagedown.getSanitizingConverter().makeHtml(
`A fast and simple way to create template projects via git!
---
This tool allows you to create a template for a new project as quickly as you can create a new project.  No need to learn any special commands, download any tools or master any arcane languages.  Just create your project like you normally would but anywhere you would type a repo-specific string, instead type \`magic_variable_magic\` or \`magic.variable.magic\` or \`magic-variable-magic\`.  Once everything is done, just commit your changes to the template repository and search for it using this tool.  You will be prompted for each of the variables you entered when generating the template repository and a new repository will be created based on the template!  Alternatively, you can use a template someone else created, making it even easier to get up and running, especially in a new language.`);
}
