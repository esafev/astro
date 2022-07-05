import type { Plugin } from 'unified';
import type { Root, RootContent, Element } from 'hast';
import type MagicString from 'magic-string';
import { visit } from 'unist-util-visit';

import { replaceAttribute, needsEscape, escape } from './utils.js';

const rehypeEscape: Plugin<[{ s: MagicString }], Root> = ({ s }) => {
	return (tree, file) => {
		visit(tree, (node: Root | RootContent, index, parent) => {
			if (node.type === 'text' || node.type === 'comment') {
				if (needsEscape(node.value)) {
					s.overwrite(node.position!.start.offset!, node.position!.end.offset!, escape(node.value));
				}
			} else if (node.type === 'element') {
				for (const [key, value] of Object.entries(node.properties ?? {})) {
					const newKey = escape(key);
					const newValue = needsEscape(value) ? escape(value) : value;
					if (newKey === key && newValue === value) continue;
					replaceAttribute(s, node, key, (value === '') ? newKey : `${newKey}="${newValue}"`);
				}
			}
		});
	};
};

export default rehypeEscape;
