### new key incoming
* user posts a key to the coordinator
* coordinator posts key to database
* coordinator signals key to nsa
* nsa determines search space for key
* nsa splits the search space into jobs
* nsa schedules jobs
* nsa signals idle workers to request jobs


#### periodically
* nsa polls external workers for status over http
  * response, `idle` `busy` > update status on internal list
  * no reponse, remove it from the pool

* nsa checks internal list of workers for idle status
  * signals idle workers to request jobs

  
