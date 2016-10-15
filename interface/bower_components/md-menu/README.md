# MD-MENU



## Installation

``` bash

bower install md-menu --save

```

## Usage

```html

<link rel="import" href="bower_components/sass-md-components/sass-md-components.html">
<link rel="import" href="bower_components/md-menu/md-menu.html">

<md-menu>
   <menu-item>
     <header><span class="icon-dashboard"></span><a>Dashboard</a></header>
   </menu-item>
   <menu-item>
     <header class="dropdown"><span class="icon-person"></span>Users</header>
     <menu-dropdown>
        <menu-item><a>Search</a></menu-item>
        <menu-item><a>Add New User</a></menu-item>
     </menu-dropdown>
   </menu-item>
</md-menu>

```

##Demo and docs

http://EllipticalElements.github.io/md-menu/

