# Cpp-Interface
A C++ interface to bridge the NodeJS server and other components


## Building the addon

to build the addon:
- Install node-gyp: `npm install -g node-gyp`
- Configure node-gyp first: `node-gyp configure`
- Build the addon: `node-gyp build`
- Now, the addon should be built in the `build/Release/` folder