// @flow

import { dismount } from "./dismounter.js";
import { mount } from "./mounter.js";
import assert from "./assert.js";
import {
    flattenElements,
} from "./utils.js";

function rehydrate(oldElement: Object, newElement: Object): Object {
    const { attrs: oldAttrs, children: oldChildren, vnode } = oldElement;
    const { attrs: newAttrs, children: newChildren } = newElement;
    assert.isTrue(vnode, 'rehydrate() method expects the first argument to be a fully funtional element.');
    console.log(`Rehydrating ${vnode}`);
    newElement.vnode = vnode;
    if (vnode.hasBodyAttribute && oldChildren !== newChildren) {
        const children = flattenElements(newChildren);
        newElement.children = children;
        console.log(`Setting new children list for ${vnode}`);
        vnode.set('body', children);
    }
    if (oldAttrs !== newAttrs) {
        const newKeys = Object.keys(newAttrs);
        const oldKeys = Object.keys(oldAttrs);
        const overlap = {};
        // infuse new attrs into element.vnode
        let newKeysLen = newKeys.length;
        for (let i = 0; i < newKeysLen; i += 1) {
            const attrName = newKeys[i];
            const attrValue = newAttrs[attrName];
            if (oldAttrs[attrName] !== attrValue) {
                console.log(`Updating attribute ${attrName}="${attrValue}" in ${vnode}`);
                vnode.set(attrName, attrValue);
            }
            overlap[attrName] = true;
        }
        let oldKeysLen = oldKeys.length;
        for (let i = 0; i < oldKeysLen; i += 1) {
            const attrName = oldKeys[i];
            if (!overlap[attrName]) {
                console.log(`Removing attribute ${attrName} in ${vnode}`);
                vnode.set(attrName, undefined);
            }
        }
    }
    return newElement;
}

export function patch(oldElement: any, newElement: any): Object {
    assert.element(newElement);
    if (oldElement === newElement) {
        return oldElement;
    }
    const { Ctor } = newElement;
    if (oldElement && oldElement.Ctor === Ctor) {
        return rehydrate(oldElement, newElement);
    } else {
        if (oldElement) {
            dismount(oldElement);
        }
        mount(newElement);
        return newElement;
    }
}
