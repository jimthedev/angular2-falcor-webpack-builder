echo "
  Please make sure you're running the latest:

  Node.js v0.12.2+ and NPM v2.10.0+

  Also make sure you've run the following
  (you may need sudo):

    npm install --global typescript
    npm install --global tsd
    npm install --global webpack
    npm install --global webpack-dev-server
    npm install --global karma-cli
    npm install --global protractor

  You should also make sure that you're using a 
  TypeScript aware editor and have at least TypeScript
  1.5 installed.
"

# Define our NG2F paths
N2F_BUILDPATH=./n2f-build
N2F_CACHEPATH=./n2f-cache
N2F_SOURCEPATH=./n2f-src

# Define our our NG2 paths
N2F_NG2_ACCOUNT=angular-class
N2F_NG2_REPO=angular2-webpack-starter

# Create a few composite paths
N2F_NG2_CACHE=$N2F_CACHEPATH/$N2F_NG2_REPO

# Clean up previous build directory
echo "\nCleaning up the build directory"
rm -rf $N2F_BUILDPATH

# Recreate a working directory for our build
mkdir $N2F_BUILDPATH

# Create a cache for our build
if [ ! -d "$N2F_CACHEPATH" ]; then
	mkdir $NGF_CACHEPATH
fi

# Clone the repo to our cache or update the cache
if [ ! -d "$N2F_NG2_CACHE" ]; then
	echo "Getting $N2F_NG2_REPO..."
	git clone https://github.com/$N2F_NG2_ACCOUNT/$N2F_NG2_REPO.git $N2F_NG2_CACHE	
else
	echo "Found cached $N2F_NG2_REPO. Pulling new commits..."
	git -C $N2F_NG2_CACHE pull
fi

echo "Copying $N2F_NG2_REPO to the build directory..."
cp -a $N2F_NG2_CACHE/. $N2F_BUILDPATH

echo "\nInstalling dependencies"
(cd $N2F_BUILDPATH && npm install)

echo "\nInstalling express and dependencies"
(cd $N2F_BUILDPATH && npm run express-install)

echo "\nInstalling Falcor, dependencies, and example dependencies from NPM"
(cd $N2F_BUILDPATH && npm install --save falcor falcor-express falcor-http-datasource falcor-router lodash diff)
(cd $N2F_BUILDPATH && npm install --save-dev json)

echo "\nInstalling TypeScript definitions for dependencies"
(cd $N2F_BUILDPATH && tsd install lodash diff --save)

echo "\nInstalling TypeScript definitions for falcor"
(cd $N2F_BUILDPATH/src/typings && sed -i "" '/path="webpack.d.ts" \/>/a\
/// <reference path="falcor.d.ts" />\
/// <reference path="falcor-http-datasource.d.ts" />' _custom.d.ts)
(cp $N2F_SOURCEPATH/client/typings/falcor.d.ts $N2F_BUILDPATH/src/typings/falcor.d.ts)
(cp $N2F_SOURCEPATH/client/typings/falcor-http-datasource.d.ts $N2F_BUILDPATH/src/typings/falcor-http-datasource.d.ts)

echo "\nInstalling "

echo "\nPatching package.json"
(cd $N2F_BUILDPATH && node ./node_modules/json/lib/json.js -I -f package.json \
	-e 'this.scripts["falcor"]="NODE_ENV=development node ./examples/server/falcor-express-server-example.js"' \
	-e 'this.scripts["falcor:dev"]="NODE_ENV=development node ./examples/server/falcor-express-server-example.js"' \
	-e 'this.scripts["falcor:prod"]="NODE_ENV=production node ./examples/server/falcor-express-server-example.js"') 

echo "\nPatching webpack.config.js"
(cd $N2F_BUILDPATH && sed -i '' 's|src/app|src/falcor-app|g' webpack.config.js)
(cd $N2F_BUILDPATH && sed -i '' '/\/\/ App/a\
\      "./node_modules/falcor/lib/index.js",\
\      "./node_modules/falcor-http-datasource/src/XMLHttpSource.js",\
\      "./node_modules/rx/dist/rx.js",\
\      "./node_modules/diff/lib/index.js",\
\      "./node_modules/lodash/index.js",' webpack.config.js)

echo "\nPatching server"
(cp $N2F_SOURCEPATH/server/falcor-express-server-example.js $N2F_BUILDPATH/examples/server/)
(cp $N2F_SOURCEPATH/server/falcor-mock-data.js $N2F_BUILDPATH/examples/server/)
(cp $N2F_SOURCEPATH/server/falcor-route-item-example.js $N2F_BUILDPATH/examples/server/)
(cp $N2F_SOURCEPATH/server/falcor-route-list-example.js $N2F_BUILDPATH/examples/server/)
(cp $N2F_SOURCEPATH/server/falcor-routes-example.js $N2F_BUILDPATH/examples/server/)
(cp $N2F_SOURCEPATH/server/falcor-router-example.js $N2F_BUILDPATH/examples/server/)

echo "\nPatching client"
(mkdir $N2F_BUILDPATH/src/falcor-app)
(cp -r $N2F_SOURCEPATH/client/falcor-app/* $N2F_BUILDPATH/src/falcor-app/)
