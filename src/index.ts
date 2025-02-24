import {
  NativeModules,
  Platform,
  NativeEventEmitter,
  InteractionManager,
} from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-knotapi' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const Knotapi = NativeModules.Knotapi
  ? NativeModules.Knotapi
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const eventEmitter = new NativeEventEmitter(Knotapi);

type CommonConfig = {
  sessionId: string;
  clientId: string;
  merchantIds?: number[];
  domainUrls?: string[];
  environment: 'production' | 'sandbox' | 'development';
  useCategories?: boolean;
  useSearch?: boolean;
  entryPoint?: string;
};

export type SuccessEvent = string;

export type ErrorEvent = {
  errorCode: string;
  errorMessage: string;
};

export type EventEvent = {
  event:
    | 'refresh session request'
    | 'merchant clicked'
    | 'login started'
    /**
     * @deprecated
     */
    | 'login success'
    | 'authenticated'
    | 'require otp';
  taskId: string;
  merchant: string;
};

export type EventTypes = {
  onSuccess: SuccessEvent;
  onError: ErrorEvent;
  onEvent: EventEvent;
  onExit: undefined;
};

type EventNames = keyof EventTypes;

export const eventNames: { [K in EventNames]: K } = {
  onSuccess: 'onSuccess',
  onError: 'onError',
  onEvent: 'onEvent',
  onExit: 'onExit',
};

export const openCardOnFileSwitcher = (params: CommonConfig) => {
  InteractionManager.runAfterInteractions(() => {
    setTimeout(() => {
      Knotapi?.openCardSwitcher(params);
    }, 50);
  });
};

export const closeKnotSDK = () => {
  Knotapi?.closeKnotSDK();
};

export const openSubscriptionManager = (params: CommonConfig) => {
  InteractionManager.runAfterInteractions(() => {
    setTimeout(() => {
      Knotapi?.openSubscriptionManager(params);
    }, 50);
  });
};

export const addSubscriptionManagerListener = <T extends keyof EventTypes>(
  eventName: T,
  callback: (event: EventTypes[T]) => void
) => {
  return eventEmitter.addListener(`SubscriptionManager-${eventName}`, callback);
};
export const addCardSwitcherListener = <T extends keyof EventTypes>(
  eventName: T,
  callback: (event: EventTypes[T]) => void
) => {
  return eventEmitter.addListener(`CardSwitcher-${eventName}`, callback);
};

export default Knotapi;
