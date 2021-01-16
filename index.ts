import Vue from "vue";
import { ActionContext, Payload, CommitOptions, DispatchOptions } from "vuex";

const NOTHING: any = undefined;

type TMutation<P> = Payload & { payload: P };

type TFactory<V, P = V> = (payload: V) => TMutation<P>;

type TMutationHandler<P, S> = (state: S, payload: P) => void;

type TContext<S, R> = Omit<Omit<ActionContext<S, R>, "commit">, "dispatch"> & {
  commit: (data: TMutation<any>, options?: CommitOptions) => void;
  dispatch: (data: TMutation<any>, options?: DispatchOptions) => Promise<any>;
};

type TActionHandler<P, S, R, V> = (ctx: TContext<S, R>, payload: P) => V;

/**
 * Action (mutation) instance factory
 * @param type Action (mutation) type
 * @param payload Action (mutation) payload
 */
export function action<P>(type: string, payload: P = NOTHING): TMutation<P> {
  return { type, payload };
}

/**
 * Append typesafe mutation to store
 */
export function useMutation<S>() {
  return function <V, P>(
    factory: TFactory<V, P>,
    handler: TMutationHandler<P, S>
  ) {
    const type = factory(null as any).type;

    return {
      [type]: handler,
    };
  };
}

/**
 * Append typesafe action to store
 */
export function useAction<S, R>() {
  return function <V, P, O>(
    factory: TFactory<V, P>,
    handler: TActionHandler<P, S, R, O>
  ) {
    const type = factory(null as any).type;

    return {
      [type](ctx: ActionContext<S, R>, payload: P) {
        function commit(data: TMutation<P>, options?: CommitOptions) {
          ctx.commit(data.type, data.payload, options);
        }

        function dispatch(data: TMutation<P>, options?: DispatchOptions) {
          return ctx.dispatch(data.type, data.payload, options);
        }

        return handler({ ...ctx, commit, dispatch }, payload);
      },
    };
  };
}

/**
 * Append typesafe getter to component computed
 */
export function mapGetter<S, R>(selector: (root: R) => S) {
  return function <V>(getter: (s: S) => V) {
    return function (this: Vue) {
      const store: S = selector(this.$store.state);
      return getter(store);
    };
  };
}

/**
 * Append typesafe mutation to component methods
 */
export function mapMutation<V, P>(factory: TFactory<V, P>) {
  return function (this: Vue, payload: V, options?: CommitOptions) {
    const mutationInstance = factory(payload);
    return this.$store.commit(
      mutationInstance.type,
      mutationInstance.payload,
      options
    );
  };
}

/**
 * Append typesafe action to component methods
 */
export function mapAction<V, P>(factory: TFactory<V, P>) {
  return function (this: Vue, payload: V, options?: DispatchOptions) {
    const actionInstance = factory(payload);
    return this.$store.dispatch(
      actionInstance.type,
      actionInstance.payload,
      options
    );
  };
}
