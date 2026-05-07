dentro de packages/one-llm-4-all voce deve definir uma lib com TS strict e com tipagem nominal semantca onde o padrao seja o rotacionamento de modelos FREE da openroute dinamiamente vindos via API, onde cada mensagema  ser enviada para LLM é feita rotacionando esses modelos para nao mandar 2 mensagens diretas para o mesmo modelo e também existe o cadatsro, via .env, de varias APi keys para que caso uma chave tenha utilizado todos os creditos de todos os modelos entao o sistema deve passar para a  proxima conta como tambem ter uma configuração de poder rotacionar cada chave em conjunto de cada envio de mensagem, nessa configuração nenhuma mensagem é enviada pela mesma chave em sequencia, então é o modo ultra-rotate, o padrão se chama self-rotate onde rotaciona sempre os modelos a cada mensagem e só rotaciona a chave após ter extinguido todas as cotas daquela chave.

NUNCA pode retornar erro para o usuário

tembém pode ser possível cadastarr diversos forncedores de IA e seus modelos, como OPENAI, Anthropic, Gemini, Deepseek, Qwen, z.ai, Mistral, etc

O que possibilita a configuração chamada premium-rotate, onde o sistema irá rotacionar primeiramente apenas os modelos pagos cadastrados no .env e utilizar os modelos free e as chaves de api key da openrouter como um fallback de quando acabar as cotas dos modelos pagos. 

Esses sistema serve como uma ultra-resiliencia no uso de LLMs, podendo ser utilizado em qualquer lugar que precise de LLMs.

Todas as chamadas para LLMs são transparentes sobre o uso de qual modelos irá utilizar, isso nunca é definido diretamente na chamada da função de enviar mensagem para a LLM, o modelo é definido internamente pelo sistema com base nas configurações e no estado atual do sistema.