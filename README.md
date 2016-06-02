#Minimal Promise version of HTTPS request

This is a wrapper for the standard HTTPS Node Request object, that provides an A+ Promise interface to request execution and automates the process of assembling the response body as a string. It can handle posting body contents, and automatically rejects the promise if the response code is not between 200 and 399. 

The intent of this library is to wrap requests into a promise interface with minimal overhead, with no dependencies, and just expose the standard Node.js arguments. 
It's not trying to be a fully-featured replacement for complex workflows, streaming etc. For more complex libraries that can provide all kind of workflows like that, see [request-promise](https://github.com/request/request-promise) and [got](https://github.com/sindresorhus/got).

##Usage

You can use the standard Node [HTTPS Request Options](https://nodejs.org/api/https.html#https_https_request_options_callback), with the following additional options:

* `body`: string -- the content to include in the request body when posting
* `resolveErrors`: boolean -- if true, HTTP error response codes will result in a resolved promise (instead of rejected). Only network errors will result in a rejected promise. If false (default), network errors and successful HTTP requests with an error response code will cause the promise to be rejected.

##Example

```javascript

var requestPromise = require('minimal-request-promise'),
  options = {
    method: 'POST',
    hostname: 'graph.facebook.com',
    path: '/v2.6/me/messages?access_token=' + fbAccessToken,
    port: 443,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipient: {
        id: recipient
      },
      message: message
    })
  };

requestPromise(options).then(
  function (response) {
    console.log('got response', response.body, response.headers);
  }, 
  function (response) {
    console.log('got error', response.body, response.headers, response.statusCode, response.statusMessage);
  }
);

```

##License

MIT
