var dataset = ( function() {

  var name,
    datasetURL, configURL,
    data, visibleData,
    config, embeddingFeatures;

  // Initialize the interface for loading a dataset and a config file
  function init() {

    d3.select( '#load-dataset-input' )
      .on( 'change', _ => {

        // Get the file name
        var dataFile = d3.event.target.files[ 0 ];
        if ( !dataFile ) return;

        // Extract the name of the dataset
        name = dataFile.name.split( '.' )[ 0 ];

        d3.select( '#dataset-name-span' ).html( dataFile.name );

        // Get the path of the file and call the function for load it
        var reader = new FileReader();
        reader.onloadend = function( evt ) {
          datasetURL = evt.target.result;
        };
        reader.readAsDataURL( dataFile );

        d3.select( '#load-data-load-btn' )
          .property( 'disabled', false );

      } );

    d3.select( '#load-config-input' )
      .on( 'change', _ => {

        // Get the file name
        var configFile = d3.event.target.files[ 0 ];
        if ( !configFile ) return;

        //d3.select( '#config-name' ).html( configFile.name );

        // Get the path of the file and call the function for load it
        var reader = new FileReader();
        reader.onloadend = function( evt ) {
          configURL = evt.target.result;
        };
        reader.readAsDataURL( configFile );

        loadConfig();

      } );

  }

  // Called from main process to load a dataset
  function loadDataset( n ) {

    //d3.select( '#load-config-btn' ).classed( 'disabled', false );
    //d3.select( '#load-config-input' ).property( 'disabled', false );

    if( n ) {
      name = n;
      datasetURL = './data/' + name + '.csv';
    }

    // Return a D3 promise when dataset has been loaded
    return d3.csv( datasetURL, d3.autoType ).then( d => {

      console.log( 'Dataset loaded sucessfully!' );

      // Remove special characters from colum names to avoid other components crash
      // This block can be slow
      var keys = Object.keys( d[ 0 ] );
      d = d.map( di => {
        return _.mapKeys( di, function( value, key ) {
          return  key.replace(/[^\w\s]/gi, '').replace( ' ', '' );
        } );
      } );

      data = d;

      data = data.map( d => {
        d.__highlighted = true;
        return d;
      } );

      // Create the configuration object by default
      config = createConfig();

    } ).catch( error => alert( 'Error loading the dataset!' ) );

  }

  // Create a configuration file based on dataset attributes
  function createConfig() {

    config = {};

    // Identify the type for each attribute
    keys = Object.keys( data[ 0 ] );
    config.features = keys.map( f => {
      return {
        name: f,
        type: identifyDataType( f )
      }
    } );

    // Defines candidates features for embedding
    config.roles = {};
    config.roles.embed = config.features
      .filter( f => f.type === 'numerical' )
      .filter( f => ( !f.name.toLowerCase().startsWith( 'id' ) ) || ( !f.name.toLowerCase().endsWith( 'id' ) ) ).map( f => f.name );
    

    // Try to select an appropiate feature for color encoding
    var categFeatures = config.features
      .filter( f => f.type === 'categorical' )
      .filter( f => f.name !== '__highlighted' );

    if( categFeatures.length > 0 ) {
      var candidates = categFeatures.filter( f => d3.map( data, d => d[ f.name ] ).keys().length <= 5 );
      if( candidates.length > 0 ) config.roles.color = candidates[ 0 ].name;        
    }    

    console.log( config.features );

    // Add features for model results
    config.features.push( {
      'name': '__x',
      //'type': 'diverging'
      'type': 'numerical'
    } );

    config.features.push( {
      'name': '__y',
      //'type': 'diverging'
      'type': 'numerical'
    } );

    config.features.push( {
      'name': '__cluster',
      'type': 'categorical'
    } );

    /*config.features.push( {
      'name': '__highlighted',
      'type': 'boolean'
    } );*/

    console.log( 'By default configuration created!' );
    console.log( config.features );
    return config;

  }

  // Identify the type of an attribute in the dataset from its values
  function identifyDataType( f ) {
    if( typeof data[ 0 ][ f ] === 'number' ) { 
      return 'numerical';
    } else {
      return 'categorical';
    } 
  }

  // Load the configuration file
  /*function loadConfig() {

    // Load the the configuration file
    d3.json( configURL ).then( c => {

      console.log( 'Configuration loaded!' );
      config = c;

      // TODO: Update with new config
      //updateWithConfig();

    } ).catch( error => console.log( 'Error loading the configuration file!' ) );

  }*/

  return {
    init: init,
    load: loadDataset,
    /*loadConfig: loadConfig,*/
    get name() {
      return name;
    },
    get data() {
      return data;
    },
    get visibleData() {
      return data.filter( d => d.selected );
    },
    get config() {
      return config;
    }
  }
} )();