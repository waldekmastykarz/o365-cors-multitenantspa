# Sample Single Page Application showing how to use CORS with Discovery Service with multi-tenant applications

This sample application shows how to combine use Discovery Service in a Single Page Application using CORS to communicate with Office 365. The SPA uses KnockoutJS for data-binding and Node.js for the server-side wrapper of the Discovery Service.

## Installation steps

1. Go to Azure AD and register a new application
	- In the **Sign-on URL** field enter `http://localhost:8080`
	- Set the **Application is multi-tenant** value to `Yes`
	- Copy the **Client ID**
	- Generate new key and copy it
	- In the **App ID URL** field enter `https://contoso.onmicrosoft.com/sample-cors-spa`, where *contoso* is the name of your Office 365 tenant
	- In the **Reply URL** field enter `http://localhost:8080`
	- In the **Permissions to other applications** section click the **Add application** button and add **Office 365 SharePoint Online**. Then, from the list of the **Delegated Permissions** choose **Read items in all site collections**
	- Enable implicit flow for the application
		- Click the **Manage Manifest** button
		- From the menu click the **Download Manifest** option
		- In the pop-up click the **Download manifest** link
		- Open the downloaded manifest file in the text editor, change the value of the **oauth2AllowImplicitFlow** property to **true** and save the changes
		- Back in Azure AD click the **Manage Manifest** button
		- From the menu click the **Upload Manifest** option
		- In the file picker select the manifest file and click the checkbox button
1. Edit the **./config.js** file
	- Set the value of the **clientId** property to the Client ID copied from Azure ID
	- Set the value of the **clientSecret** property to the key copied from Azure AD
1. Edit the **./public/js/script.js** file
	- Set the value of the **config.clientId** property to the Client ID copied from Azure ID
1. Start the application
	- Open console/terminal
	- $ `node server.js`