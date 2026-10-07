import { evaluateScenario } from '../domain/evaluate';
import { findConditions, SearchCancelled } from '../domain/optimize';
import type { Request, Response } from './protocol';
let searchId = 0;
const send = (response: Response) => self.postMessage(response);
self.onmessage = async (event: MessageEvent<Request>) => {
  const request = event.data;
  if (request.type === 'cancel') {
    searchId = request.id;
    return;
  }
  try {
    if (request.type === 'evaluate')
      send({ type: 'evaluated', id: request.id, result: evaluateScenario(request.scenario) });
    else {
      searchId = request.id;
      const result = await findConditions(request.scenario, {
        cancelled: () => searchId !== request.id,
        progress: (tested, total) => send({ type: 'progress', id: request.id, tested, total }),
      });
      if (searchId === request.id) send({ type: 'searched', id: request.id, result });
    }
  } catch (error) {
    if (!(error instanceof SearchCancelled))
      send({
        type: 'error',
        operation: request.type,
        id: request.id,
        error: error instanceof Error ? error.message : 'No fue posible completar el cálculo.',
      });
  }
};
