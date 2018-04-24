# Kowhub
This is a web application work-in-progress using Django and React. It aspires to be an easy-to-use armybuilder tool for Mantic's tabletop game Kings of War.

www.kowhub.com

## Getting Started
Get started with development as follows.

#### Dependencies

```
python-dev
python-virtualenv
yarn
```

#### Clone project and install

```
git clone https://github.com/torkelbe/kowhub.git
cd kowhub
make
```

#### Manage project
Fabric is configured with functions for the most common management tasks.

```
fab help
```

## Project Overview

```python
kowhub
├── django                  # django root directory
│   ├── apps
│   │   ├── builder             # armybuilder django app
│   │   └── kowpdf              # server-side PDF generator
│   ├── config
│   └── static
├── frontend                # frontend root directory
│   ├── bundles-dev             # webpack bundles
│   ├── bundles-prod            # webpack bundles
│   ├── node_modules
│   ├── src
│   │   ├── builder             # armybuilder react app
│   │   │   ├── components
│   │   │   └── stylesheets
│   │   ├── img
│   │   └── lib                 # data management libraries
│   └── webpack
├── kowsourcedata           # python module for managing static source data
└── scripts                 # various scripts for development
```


