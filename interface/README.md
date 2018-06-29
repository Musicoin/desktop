[![Travis](https://img.shields.io/travis/etaletai13/desktop-interface.svg?style=for-the-badge)](https://github.com/Musicoin/desktop-interface)

# Musicoin Desktop - Interface Module
Default UX Module for [Musicoin Desktop Client](https://github.com/Musicoin/desktop)

## Contributing
1. First, clone the main desktop codebase and this module.
    1. `git clone git@github.com:Musicoin/desktop.git`
    2. `git clone git@github.com:Musicoin/desktop-interface.git`
2. Second, change the dependency location in the main app.
    1. (substitute `vim` for your preference) `vim desktop/package.json`
    2. Find `"interface": "github:Musicoin/desktop-interface"` to `"interface": "../desktop-interface"`
3. Third, make your changes to the interface module, and test according to [Musicoin Instructions(https://github.com/Musicoin/desktop).

At this point the desktop client should popup and run.  From here on out you should be able to run 'yarn debug' to see the desktop client in action.

## Screenshot
![Musicoin Wallet 1.5](1.5.png)
