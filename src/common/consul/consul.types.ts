export interface ConsulService {
  name: string;
  id: string;
  tags?: string[];
  address?: string;
  port?: number;
  meta?: Record<string, string>;
  check?: {
    http?: string;
    tcp?: string;
    script?: string;
    interval?: string;
    timeout?: string;
    ttl?: string;
  };
}

export interface ConsulAgent {
  service: {
    register: (
      service: ConsulService,
      callback?: (err?: Error) => void,
    ) => Promise<void> | void;
    deregister: (
      serviceId: string,
      callback?: (err?: Error) => void,
    ) => Promise<void> | void;
  };
  check: {
    register: (
      check: any,
      callback?: (err?: Error) => void,
    ) => Promise<void> | void;
    deregister: (
      checkId: string,
      callback?: (err?: Error) => void,
    ) => Promise<void> | void;
  };
}

export interface ConsulClient {
  agent: ConsulAgent;
  kv: {
    get: (key: string, options?: any) => Promise<any>;
    set: (key: string, value: string, options?: any) => Promise<boolean>;
    del: (key: string) => Promise<boolean>;
  };
}
