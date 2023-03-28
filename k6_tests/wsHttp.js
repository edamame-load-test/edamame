import http from 'k6/http';
import { WebSocket } from "k6/x/websockets";
import { clearTimeout, setInterval } from "k6/x/timers";

export let options = {
  stages: [
    { target: 50000, duration: '600s' },
    { target: 0, duration: '600s' },
  ],
};

export default function () {
  const numRequests = [1,2,3,4];
  let randomNum =  Math.floor(Math.random() * 10) + 1;

  if (randomNum === 1) {
    numRequests.forEach(() => {
      http.get('https://test-api.k6.io/');
    });
  }
  
  if (randomNum === 2) {
    numRequests.forEach(() => {
      http.get('https://test.k6.io/contacts.php');
    });
  }
  
  if (randomNum === 3) {
    numRequests.forEach(() => {
      http.get('https://test-api.k6.io/public/crocodiles/');
    });
  }
  
  if (randomNum === 4) {
    numRequests.forEach(() => {
      http.get('https://en.wikipedia.org/wiki/Edamame');
    });
  }

  if (randomNum === 5) {
    numRequests.forEach(() => {
      http.get('https://en.wikipedia.org/wiki/Owl');
    });
  }

  if (randomNum === 6) {
    numRequests.forEach(() => {
      http.get('https://en.wikipedia.org/wiki/Cat');
    });
  }

  if (randomNum === 7) {
    numRequests.forEach(() => {
      http.get('https://community.grafana.com/t/alert-query-not-working-with-global-variables/74603');
    });
  }

  if (randomNum === 8) {
    numRequests.forEach(() => {
      http.get('https://docs.timescale.com/timescaledb/latest/tutorials/grafana/grafana-variables/');
    });
  }

  if (randomNum === 9) {
    numRequests.forEach(() => {
      http.get('https://indeni.com/blog/building-powerful-grafana-dashboards/');
    });
  }

  if (randomNum === 10) {
    numRequests.forEach(() => {
      http.get('https://docs.aws.amazon.com/grafana/latest/userguide/variables-types.html');
    });
  }


  if (randomNum <= 2) {
    const url = 'ws://127.0.0.1:8000/';
    const params = { tags: { my_tag: 'hello' } };
    let ws = new WebSocket(url);
    ws.addEventListener("open", () => {

      setInterval(() => {
        ws.ping();
      }, 10000); 
    });
  }

  if (randomNum > 2 && randomNum <= 4) {
    const url = 'ws://echo.websocket.org';
    let ws = new WebSocket(url);
    const params = { tags: { my_tag: 'hello' } };

    ws.addEventListener("open", () => {
      setInterval(() => {
        ws.ping();
      }, 10000); 

    });
  }

  if (randomNum > 4 && randomNum <= 6) {
    let chatRoomName = "random";
    let url = `wss://test-api.k6.io/ws/crocochat/${chatRoomName}/`;
    let ws = new WebSocket(url);
    const params = { tags: { my_tag: 'hello' } };

    ws.addEventListener("open", () => {
      ws.send(JSON.stringify({ 'event': 'SET_NAME', 'new_name': `Croc:${__VU}` }));

      ws.addEventListener("message", (e) => {
        let msg = JSON.parse(e.data);
        if (msg.event === 'CHAT_MSG') {
          console.log(`VU ${__VU}: received: ${msg.user} says: ${msg.message}`)
        }
        else if (msg.event === 'ERROR') {
          console.error(`VU ${__VU}: received:: ${msg.message}`)
        }
        else {
          console.log(`VU ${__VU}: received unhandled message: ${msg.message}`)
        }
      })

    setInterval(() => {
      ws.send(JSON.stringify({ 'event': 'SAY', 'message': "what's up everyone" }));
    }, 10000); 

      ws.addEventListener("close", () => {
        clearTimeout(timeout1id);
        clearTimeout(timeout2id);
        console.log(`VU ${__VU}:${id}: disconnected`);
      })
    });
  }
}