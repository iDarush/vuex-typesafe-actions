## Installation

```
npm i --save vuex-typesafe-actions
```

## Usage

module.ts
```typescript
import { MutationTree, ActionTree } from 'vuex';
import { action, useAction, useMutation } from 'vuex-typesafe-actions';
import { RootStore } from '../store';
import loadData from './api';

export interface ModuleStore { 
    data: string;
}

const a = useAction<ModuleStore, RootStore>();
const m = useMutation<ModuleStore>();

// mutations
export const M_SET_DATA = (data: string) => action('module-set-data', string);

// actions
export const A_LOAD_DATA = (id: string) => action('module-load-data', id);

const mutations: MutationTree<ModuleStore> = {
    ...m(M_SET_DATA, (s, data) => {
        s.data = data;
    })
};

const actions: ActionTree<DepartmentsStore, RootStore> = {
    ...a(A_LOAD_DATA, async ({ commit }, id) => {
        try {
            const data = await loadData(id);
            commit(M_SET_DATA(data));
        } catch (er) {
            console.error(er);
        }
    })
};

const store = {
    state: { data: '' },
    mutations,
    actions
};

export default store;

```

component.vue
```typescript
<template>{{data}}</template>

<script lang="ts">

import Vue from 'vue';
import { mapAction } from 'vuex-typesafe-actions';
import { RootStore } from '../store';
import { A_LOAD_DATA } from './module';

const moduleSelector = (root: RootStore) => root.module;

const Component = Vue.extend({
    computed: {
        data: moduleSelector((s) => s.data)
    },
    methods: {
        fetch: mapAction(A_LOAD_DATA)
    },
    beforeMount () {
        this.fetch('1');
    }
});

</script>
```