module.exports = function(paths) {

  var top = [], bottom = [];

  ['css'].forEach(function(assetType){
    var assets = paths[assetType];
    if (typeof assets !== 'object') return false;
    assets.forEach(function(asset){
      if (typeof asset === 'string') asset = {path: asset};
      top.push('<link href="' + asset.path + '" media="' + (asset.media || 'screen') + '" rel="stylesheet" type="text/css">');
    });
  });

  ['js'].forEach(function(assetType){
    var assets = paths[assetType];
    if (typeof assets !== 'object') return false;
    assets.forEach(function(asset){
      if (typeof asset === 'string') asset = {path: asset};
      bottom.push('<script src="' + asset.path + '" type="text/javascript"></script>');
    });
  });

  return {top: top.join("\n"), bottom: bottom.join("\n")};

}