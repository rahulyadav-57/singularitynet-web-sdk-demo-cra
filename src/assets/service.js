var ProtoFiles_example_pb = require("./example_pb");

var example = example || {};

example.Calculator = (function () {
  function Calculator() {}
  Calculator.serviceName = "example.Calculator";
  return Calculator;
})();

example.Calculator.add = {
  methodName: "add",
  service: example.Calculator,
  requestStream: false,
  responseStream: false,
  requestType: ProtoFiles_example_pb.Numbers,
  responseType: ProtoFiles_example_pb.Result
};

exports.example = example;
