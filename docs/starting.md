<script setup>
import { reactive, computed } from 'vue'

const config = reactive({
    username: 'ghuser',
    projectname: 'my_cool_project',
    description: 'my new research project'
})
</script>

<style lang="css">
.vp-doc  label {
    font-weight: bold;
    font-size: 1.1em;
    color: #42b883;
}
.vp-doc input {
    border: 1px;
    width: 100%;
    font-size: 1.1em;
    background-color: white;
    border: 1px solid #999;
    padding-left: 10px;
    color: rgb(84, 84, 84);
}
.form {
    width: 100%;
    border-collapse:collapse;
    border: 0px;
}

.label {
    text-align: right;
    border: none;
   
}
.data {
    width: 60%;
    border: none;
}
.vp-doc td {
    vertical-align:top;
    border: none;
    font-size: 1em;
}
.vp-doc tr {
    border: none;
    font-size: 1em;
}
</style>


# Starting a new project

When you start a new project, there are a few one-time steps you must take.
These essentially boil down to copying the current version
of the Smile project, adjusting the configuration settings for your project,
and running a setup script.

**Don't worry it is easy and most of it you only do once!**

:::details Customize this page!
To prevent typo errors you can enter the key details of your project here and the example commands
below will be adapted for your situation allowing you to simply cut and paste without modifying the commands.  This also give some recommendations.  Things throughout this page will update as you type, nothing is stored.

<table class="form">
    <tr>
        <td class="label">
            <label for="username">GitHub username</label><br>
            Enter your GitHub user name here. 
        </td>
        <td class="data">
            <input id="username" type="text" v-model="config.username" />
        </td>
    </tr>
    <tr>
        <td class="label">
            <label for="projectname">Project name</label><br>
            We highly recommend you use underscores for spaces and name your project based on 
the science (e.g., `question_asking`).  
        </td>
        <td class="data">
            <input id="projectname" type="text" v-model="config.projectname" />
        </td>
    </tr>
    <tr>
        <td class="label">
            <label for="description">Description</label><br>
            Provide a one sentence description of your experiment. 
        </td>
        <td class="data">
            <input id="description" type="text" v-model="config.description" />
        </td>
    </tr>
</table>



:::




## 1. Copy over the basic project

Set your current working directory to where you would like to place your files.
For example, on Mac this might be your desktop

```
cd ~/Desktop
```

Following the steps below, copy the **🫠 Smile** GitHub repo into a new project name and clone it locally.


In this example command, the new project will be named `{{config.projectname}}` and a copy of the starting project template will be placed in a new folder with that name:


<div class="language-"><pre><code><span class="line"><span style="color:#A6ACCD">gh repo create {{config.projectname}} --private --clone --template nyuccl/smile</span></span></code></pre></div>

Next, alter the Github description for your new repo:

<div class="language-"><pre><code><span class="line"><span style="color:#A6ACCD">gh repo edit {{config.username}}/{{config.projectname}} --description "{{config.description}}"</span></span></code></pre></div>


After this you can visit GitHub and you should see a new repo in your personal repositories list: [http://github.com/{{config.username}}/{{config.projectname}}](http://github.com/{{config.username}}/{{config.projectname}})

Finally change into the newly created project directory (assuming you called your project `{{config.projectname}}`):

<div class="language-"><pre><code><span class="line"><span style="color:#A6ACCD">cd {{config.projectname}}</span></span></code></pre></div>


## 2. Configure your project


Information about the configuration setting is [here](/configuration) but if you are in the gureckislab you will want to simply decrypt the files provided in the repository.

::: danger Warning!
This will only work if you have first sent Todd your gpg key and waited for him to push a change to the **🫠 Smile** repo.
:::

To do this simply type: 

```
git secret reveal
```

this should create several `.env.*.local` files in your `env/` directory.

After all the necessary files are in the `env` folder run:

```
npm run config:upload
```

to configure your deployment process.

## 3. Setup the project

Next run the `npm run setup_project` command:

```
npm run setup_project
```

This will clean up git history for the base Smile project, remove some files you will not need, and install the required node packages for development.


## 4. Test the deployment

If you have properly configured your application the last command should have created an initial deployment of your project.  If you are in the gureckislab look join the `#smile-deploy` slack channel.  A robot there will let you know that your project was deployed and provide you with a web link the the live site.  

If that doesn't work then continue reading to learn more about [deployments](/deploy) including debugging tips.

From here on out any time you make a change to any file (except in the `docs/` folder), commit it, and push that change to your project repository the Slack bot will confirm your code has been uploaded. 

## 5. Begin developing!

Next you can begin testing and developing your app!

Simply type

```
npm run dev
```

to run the development server and see the current, default setup of the site.  More information about developing is available [here](/developing).





