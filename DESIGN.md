# process / network topology

### `user interaction`

#### first time `create keys` `post message`
* User creates a key
* User uploads the key to Coordinator
  * Coordinator uploads key to NSA for cracking
    * NSA cracks key
    * NSA uploads cracked key to Coordinator
    * Coordinator associates cracking statistics
* User downloads a random key
* User creates a message
* User posts a message

#### next time `read message` `get crack information`
* User downloads a message
* User enters a private key
* User decrypts the message

#### `Coordinator`

Everything is mediated through the Coordinator.  The User panel will post keys and messages to it.  The NSA will hear about new keys from the coordinator, and post cracked keys to the coordinator.  The only persistent state exists in the database mediated through the coordinator.

#### boot
* connects to the database
* queries database for un-cracked keys
  * sends results to NSA for processing
* listens for messages from the NSA

#### on-message 'coordination'


##### database schema

```
{
  type: 'keypair',
  publickey: String,    // key data
  privatekey: String,   // empty until cracked
  generator: String,    // group generator
  prime: String,        // group prime
  cracked: String,      // 'true' / 'false'
  cracked_at: Number    // unixtime,
}
```

```
{
  type: 'message',
  from: ObjectID,       // key pair
  to: ObjectID,         // key pair
  content: String,      // AES encrypted data
}
```

##### ui routes

* `/` status

##### api routes

* `GET` `/health_check`
* `GET` `/random_key` returns a random key, called by the user during first time
* `GET` `/message/:id` returns a message by id
* `POST` `/store_public_key` sent by the User during first time
* `POST` `/cracked_key` sent by the NSA after cracked
* `POST` `/blocks_explored` sent by the NSA during cracking
* `POST` `/message` sent by the User during first time

#### `User`




#### `NSA`

##### nsa
* gets uncracked keys from the coordinator
* posts search blocks to the workers
* gets cracked keys from the workers
* posts cracked keys to the coordinator

##### nsa worker
* get search blocks from nsa coordinator
* posts completed search blocks to coordinator
* posts cracked keys to coordinator
