## Contributing guidelines

1. PR description must include a short summary of what the PR aims to achieve
2. Commit summary must capture the appropriate changes correctly
3. No redundant/unnecessary commits (please squash them)
4. All commit summaries + PR descriptions must be in English.

## Translating guidelines

To create a new locale you need to copy en.json file located under `./interface/styles/locales` into the new file with your language code.

Examples of Strings are:

```
"profileViewHtml_Btn_REMOVE"
"profileViewHtml_Btn_SEND_FUNDS_SMALL"
```

This are the strings referring to the Remove and Send Funds buttons under account details. (remove on the left side of the avatar, and Send on the right side). You may need shorter strings here.

Also `"mainStatusJS_sync":` and `"mainStatusJS_sync_percent"` might be too long and could overlap the 3 buttons on the right side. In case you need to save space, you can remove the complete word and retain just the `%` sign.

To add a new translation entrym you need to add a new item under advanced (in the navbar) in `interface/elements/msc-profile-view/msc-profile.js`

```
    advanced.append(new nw.MenuItem({ label: enLang, click: function() { document.querySelector("msc-profile-view").changeLanguage("en"); } }));
    advanced.append(new nw.MenuItem({ label: ruLang, click: function() { document.querySelector("msc-profile-view").changeLanguage("ru"); } }));
```

In case you face difficulty doing the same, please mention it in the PR's description and we'll do that for you. You must however test the translations before making a PR by changing the language code under `settings.js` located at `\AppData\Roaming\Musicoin\config\settings.js` folder under Windows, in `~./musicoin/config/settings.js` under Linux and in `Username/Library/Musicoin/config/settings.js` under macOS.

Once you're done editing these files, commit them, push to your fork and then make a Pull Request.
