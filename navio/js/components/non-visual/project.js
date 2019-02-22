
function project( data, config ) {

  /* Hyper-parameters algorithm */
  var ITERATIONS = 1000,
    PERPLEXITY = 30,
    EPSILON = 200
    DIMENSIONS = 2;

  // Build hyper-parameters object
  var params = {}
  params.epsilon = EPSILON; 
  params.perplexity = PERPLEXITY;
  params.dim = DIMENSIONS;

  console.info( 'Projecting data in ' + ITERATIONS + ' iterations!' );
  console.info( params );
  console.info( 'Attributes: ' + config.features.filter( f => f.project === true ).length );
  console.info( 'Items: ' + data.filter( d => d.visible === true ).length );

  // Transform data to multi-dimensional array
  var arrayData = [];
  data.forEach( d => {
    
    row = [];
    config.features.forEach( feature => {
      if( feature.project )
        row.push( +d[ feature.name ] );
    } );
    arrayData.push( row );
  } );

  // Instantiate t-SNE object and attach the data
  var tsne = new tsnejs.tSNE( params );
  tsne.initDataRaw( arrayData );

  // Run t-SNE iterations
  for( var k = 0; k < ITERATIONS; k++ ) {
    tsne.step();
  }

  console.info( 'Projection finished!' );

  return tsne.getSolution();

}