import './index.css';
import { Elm } from './Main.elm';

const commandEndpoint = 'http://195.35.19.148:13032/agents/coordinator';
const websocketUrl =
  import.meta.env.VITE_AGENTS_WS_URL ||
  window.localStorage.getItem('agents_ws_url') ||
  'ws://195.35.19.148:13032/agents/events';

const app = Elm.Main.init({
  node: document.getElementById('root'),
});

function connectAgentsWebSocket() {
  if (!app.ports?.agentEventReceived || !('WebSocket' in window)) return;

  let socket;
  let retryMs = 1000;

  const open = () => {
    socket = new WebSocket(websocketUrl);

    socket.addEventListener('open', () => {
      retryMs = 1000;
    });

    socket.addEventListener('message', (event) => {
      try {
        app.ports.agentEventReceived.send(JSON.parse(event.data));
      } catch {
        app.ports.agentEventReceived.send({
          agent: { id: 'agent.websocket', name: 'WebSocket', role: 'devops', runtime: 'custom', host: websocketUrl },
          event: { type: 'step.error', status: 'retrying', severity: 'warn', msg: 'JSON inválido' },
        });
      }
    });

    socket.addEventListener('close', () => {
      window.setTimeout(open, retryMs);
      retryMs = Math.min(retryMs * 2, 15000);
    });

    socket.addEventListener('error', () => {
      socket.close();
    });
  };

  open();
}

if (app.ports?.sendAgentCommand) {
  app.ports.sendAgentCommand.subscribe(async ({ prompt, agent_id }) => {
    try {
      await fetch(commandEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, agent_id }),
      });
    } catch {
      app.ports.agentEventReceived?.send({
        agent: { id: agent_id, name: agent_id, role: 'custom', runtime: 'custom', host: commandEndpoint },
        event: { type: 'step.error', status: 'blocked', severity: 'error', msg: 'Envio falhou' },
      });
    }
  });
}

connectAgentsWebSocket();
