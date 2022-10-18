  exports =  function() {
   // Log a trigger start time
  var currDate = new Date();
  console.log('Trigger refreshMaterializedViews started at ' +  currDate.toString() );

  
  // Query  all the needed materialized Views from the configuration collection
  const materializedViews =  context.services.get("CLUSTER_NAME").db("DB_NAME").collection("COLLECTION_NAME");
  materializedViews.find().toArray().then( viewsList =>

  { 
    // Create an execution array of all the $merge commands
    var commandArray = [];
    viewsList.forEach(function(view){var collection = context.services.get("CLUSTER_NAME").db(view.sourceDb).collection(view.sourceCollection);
    var pipeline = EJSON.parse(view.pipeline);
    commandArray.push(collection.aggregate(pipeline).toArray());
    console.log('Refreshed Materialized View: '+ view.targetCollection);
  });

  
  // Run all $merge in a promise to optimize their parallel run.
    Promise.all(commandArray).then(result => {
    currDate = new Date();
    console.log('Finished all refreshes at ' + currDate);
    }).catch( err => {
      console.error(err);});
    }).catch( err => {
      console.error(err)});
};
