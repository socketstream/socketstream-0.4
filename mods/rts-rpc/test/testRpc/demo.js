exports.actions = function(req, res, ss){

  return {

    square: function(number) {
      res(null, number * number);
    }

  };
};