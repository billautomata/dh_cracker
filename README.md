# nodejs / raspberry pi implementation

* (4x) raspberry pi 2
  * client computer
  * client computer
  * Message Server
  * NSA computer
* (12x) raspberry pi zero
  * cracking slaves

## stats

24 bits in 166 seconds.

## client interface

A terminal with a screen and a keyboard.  The screen prompts the user to press `Enter` to begin.  

```
∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆
∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆
∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆
∆∆∆                                                                          ∆∆∆
∆∆∆                                                                          ∆∆∆
∆∆∆        Welcome to the Secure Message Service!                            ∆∆∆
∆∆∆                                                                          ∆∆∆
∆∆∆                                                                          ∆∆∆
∆∆∆           Send a secure message!                                         ∆∆∆
∆∆∆                                                                          ∆∆∆
∆∆∆           Verify the Security of your Message!                           ∆∆∆
∆∆∆                                                                          ∆∆∆
∆∆∆                                                                          ∆∆∆
∆∆∆                                                                          ∆∆∆
∆∆∆                                                                          ∆∆∆
∆∆∆              1. send a message                                           ∆∆∆
∆∆∆                                                                          ∆∆∆
∆∆∆              2. check your messages                                      ∆∆∆
∆∆∆                                                                          ∆∆∆
∆∆∆                                                                          ∆∆∆
∆∆∆                                                                          ∆∆∆
∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆
∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆
∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆
input>
```

```
∆∆∆ Send a Message

∆∆∆ Enter your name ∆∆∆
input> Bill.

Hi, Bill.

Generating keys... (from strength read by potentiometer)

∆∆∆∆∆∆ your keys ∆∆∆∆∆∆∆
∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆∆
bit strength   12
generator      2
p              16034483
public key     4934484
private key    5917539

Write down your public key!

private key    5917539

You will need to enter it to check your messages.

Posting your keys to the Message Server... done!

∆∆∆ Enter the message ∆∆∆
input> I love milk.

Finding a random user to encrypt the message for... Found!

User, Jericho!

Jerico's public key is: 12111349.

Your shared secret with Jericho is: 7868685

Encrypting Data with the Shared Secret as the password.

encrypted data: 600761989541546499005717329889500488

Posting encrypted data for Jericho to the Message Server... done!

Thank you !

*** blinks for 10 seconds **

*** resets ***

```

After the user sends the message, the NSA computer lights up with the new information, displaying the metadata for the transaction.

```
ID: 3491, Message from Bill > Jericho!
ID: 3491, MESSAGE ( data: 600761989541546499005717329889500488 )
ID: 3491, PUBKEYA ( 2, 16034483, 4934484 )
ID: 3491, PUBKEYB ( 2, 16034483, 12111349 )
Adding keys to cracking queue...

*** later ***

ID: 3491, Message from Bill > Jericho -- CRACKED -- 'I love milk.'
```
