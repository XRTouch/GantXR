#include <node.h>
#include <v8.h>
#include "glove.hpp"

void SetIndexForce(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    v8::Isolate *isolate = args.GetIsolate();
    if (args.Length() < 1) return;
    if (!args[0]->IsNumber()) return;
    double value;
    value = args[0]->NumberValue(isolate->GetCurrentContext()).FromMaybe(value);
    setIndexForce(value);
}

void SetThumbForce(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    v8::Isolate *isolate = args.GetIsolate();
    if (args.Length() < 1) return;
    if (!args[0]->IsNumber()) return;
    double value;
    value = args[0]->NumberValue(isolate->GetCurrentContext()).FromMaybe(value);
    setThumbForce(value);
}

void SetAmplitude(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    v8::Isolate *isolate = args.GetIsolate();
    if (args.Length() < 1) return;
    if (!args[0]->IsNumber()) return;
    double value;
    value = args[0]->NumberValue(isolate->GetCurrentContext()).FromMaybe(value);
    setAmplitude(value);
}

void Init(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    if (args.Length() < 1) return;
    v8::Isolate *isolate = args.GetIsolate();
    v8::String::Utf8Value str(isolate, args[0]);
    std::string port(*str);
    serial_start(port);
}

void Close(const v8::FunctionCallbackInfo<v8::Value> &args)
{
    serial_stop();
}

// Not using the full NODE_MODULE_INIT() macro here because we want to test the
// addon loader's reaction to the FakeInit() entry point below.
extern "C" NODE_MODULE_EXPORT void
NODE_MODULE_INITIALIZER(v8::Local<v8::Object> exports, v8::Local<v8::Value> module, v8::Local<v8::Context> context)
{
    NODE_SET_METHOD(exports, "setThumbForce", SetThumbForce);
    NODE_SET_METHOD(exports, "setIndexForce", SetIndexForce);
    NODE_SET_METHOD(exports, "setAmplitude", SetAmplitude);
    NODE_SET_METHOD(exports, "init", Init);
    NODE_SET_METHOD(exports, "close", Close);
}

static void Useless(v8::Local<v8::Object> exports, v8::Local<v8::Value> module, v8::Local<v8::Context> context)
{
    
}

// Define a Node.js module, but with the wrong version. Node.js should still be
// able to load this module, multiple times even, because it exposes the
// specially named initializer above.
#undef NODE_MODULE_VERSION
#define NODE_MODULE_VERSION 3
NODE_MODULE(NODE_GYP_MODULE_NAME, Useless)