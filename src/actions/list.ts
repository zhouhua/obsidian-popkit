import type { HandlerParams } from "src/types";
import shuffle from "lodash/shuffle";
import L from "src/L";

export const list = {
	name: 'list',
	desc: L.actions.list(),
	icon: 'List',
	test: '.+',
	command: 'editor:toggle-bullet-list'
};

export const sortedList = {
	name: 'ordered list',
	desc: L.actions.orderedList(),
	icon: 'ListOrdered',
	test: '.+',
	command: 'editor:toggle-numbered-list'
};

export const mergeLines = {
	name: 'merge lines',
	desc: L.actions.mergeLines(),
	icon: 'ListStart',
	test: '.+',
	handler: ({replace, selection}: HandlerParams) => {
		replace(selection.split(/[\r\n]+/).map(line => line.trim()).join(''));
	}
};

export const sortLines = {
	name: 'sort lines',
	desc: L.actions.sortLines(),
	icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMTQgMTQiPjxwYXRoIGZpbGw9IndoaXRlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zLjc1IDBhMSAxIDAgMCAxIDEgMXY5aDEuNWEuNzUuNzUgMCAwIDEgLjUzIDEuMjhsLTIuNSAyLjVhLjc1Ljc1IDAgMCAxLTEuMDYgMGwtMi41LTIuNUEuNzUuNzUgMCAwIDEgMS4yNSAxMGgxLjVWMWExIDEgMCAwIDEgMS0xbTguMTY3Ljc1YS43NS43NSAwIDAgMC0xLjUgMGEuNS41IDAgMCAxLS41LjVIOS41YS43NS43NSAwIDAgMCAwIDEuNWguNDE3Yy4xNzIgMCAuMzQtLjAyMi41LS4wNjNWNUg5LjVhLjc1Ljc1IDAgMCAwIDAgMS41aDMuMzM0YS43NS43NSAwIDAgMCAwLTEuNWgtLjkxN3ptLS44MzkgOS4zNDRoLS42NTZhLjY3Mi42NzIgMCAwIDEgMC0xLjM0NGguNjU2Yy4zNyAwIC42Ny4yOTguNjcyLjY2N3YuMDFhLjY3Mi42NzIgMCAwIDEtLjY3Mi42NjdtMC0yLjg0NGMxLjExIDAgMi4wMjcuODMzIDIuMTU3IDEuOTA5Yy4wMS4wNS4wMTUuMS4wMTUuMTUzdjIuNjI3YTIuMDYyIDIuMDYyIDAgMCAxLTIuMDYyIDIuMDYyaC0uODc1Yy0uOSAwLTEuNjYyLS41NzUtMS45NDUtMS4zNzVhLjc1Ljc1IDAgMSAxIDEuNDE0LS41Yy4wNzguMjIuMjg3LjM3NS41My4zNzVoLjg3NmMuMzEgMCAuNTYyLS4yNTIuNTYyLS41NjN2LS40NWEyLjE3IDIuMTcgMCAwIDEtLjY3Mi4xMDdoLS42NTZhMi4xNzIgMi4xNzIgMCAwIDEgMC00LjM0NHoiIGNsaXAtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==',
	test: '\n',
	handler: ({replace, selection}: HandlerParams) => {
		replace(selection.split(/[\r\n]+/).sort().join('\n'));
	}
};

export const reverseLines = {
	name: 'reverse lines',
	desc: L.actions.reverseLines(),
	icon: 'ListRestart',
	test: '\n',
	handler: ({replace, selection}: HandlerParams) => {
		replace(selection.split(/[\r\n]+/).reverse().join('\n'));
	}
};

export const shuffleLine = {
	name: 'shuffle lines',
	desc: L.actions.shuffleLines(),
	icon: 'Shuffle',
	test: '\n',
	handler: ({replace, selection}: HandlerParams) => {
		replace(shuffle(selection.split(/[\r\n]+/)).join('\n'));
	}
};
