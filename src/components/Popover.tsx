import { App, Editor } from "obsidian";
import { FC, useEffect, useRef, useState } from "react";
import { ItemType, PopoverItem } from "src/types";
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import Item from "./Item";
import { changeAction } from "src/utils";
import { Devider, PopoverContainer } from "./styles";


interface PopoverProps {
	editor?: Editor;
	destory?: () => void;
	out?: HTMLElement;
	actions: PopoverItem[];
	app: App;
	type?: 'normal' | 'setting';
}

const Popover: FC<PopoverProps> = ({
	editor,
	destory,
	out,
	actions,
	app,
	type = 'normal'
}) => {
	const selection = editor?.getSelection();
	const listRef = useRef<HTMLUListElement>(null);
	const [positionLeft, setPositionLeft] = useState(0);
	const [positionTop, setPositionTop] = useState(0);

	function calcPosition() {
		const pos = editor!.getCursor();
		/* @ts-ignore */
		const coord: { left: number; top: number } = editor.coordsAtPos(pos);
		const rect = out!.getBoundingClientRect();
		const left = coord.left - rect.left;
		const top = coord.top - rect.top + out!.scrollTop;
		const height = listRef.current?.clientHeight || 0;
		const width = listRef.current?.clientWidth || 0;
		setPositionLeft(Math.max(left - width / 2, 20));
		setPositionTop(top - 20 - height);
	}

	function getMarkdown() {
		return editor!.getValue();
	}

	function replace(text: string) {
		editor!.replaceSelection(text);
	}
	const filterList = actions
		.map((item) => {
			if (item.type === ItemType.Divider) {
				return item;
			}
			return { type: item.type, action: changeAction(item.action, type, item.action.exampleText) };
		})
		.filter((item) => {
			if (type === 'setting' || item.type === ItemType.Divider) {
				return true;
			}
			const action = item.action;
			let valid = Boolean(action.name || action.icon);
			if (valid && action.test) {
				const reg = new RegExp(action.test?.replace(/\\/g, "\\\\") ?? "");
				valid = reg.test(selection ?? '') && Boolean(action.name || action.icon);
			}
			if (valid && action.dependencies) {
				valid = action.dependencies.every((dep) => {
					return app.plugins.enabledPlugins.has(dep);
				});
			}
			return valid;
		})
		.filter((item, i, list) => {
			if (item.type === ItemType.Divider) {
				if (i > 0 && list[i - 1].type === ItemType.Divider) {
					return false;
				}
				return i !== 0 && i !== list.length - 1;
			}
		});

	useEffect(() => {
		if (type === 'normal') {
			calcPosition();
			const observer = new ResizeObserver(calcPosition);
			observer.observe(out!);
			out!.addEventListener("scroll", calcPosition);
			return () => {
				observer.unobserve(out!);
				out!.removeEventListener("scroll", calcPosition);
			};
		}
	}, [type]);

	return (
		<ClickAwayListener onClickAway={() => type === 'normal' && destory!()}>
			<PopoverContainer
				type={type}
				style={{ left: `${positionLeft}px`, top: `${positionTop}px` }}
			>
				<ul ref={listRef}>
					{filterList.map((popoverItem, i) => (
						<li key={`${i}`}>
							{popoverItem.type === ItemType.Action ? <Item
								action={popoverItem.action}
								editor={editor}
								app={app}
								getMarkdown={getMarkdown}
								selection={(type === 'normal' ? selection : popoverItem.action.exampleText) || ''}
								finish={destory}
								replace={replace}
								type={type}
							/> : <Devider />}
						</li>
					))}
				</ul>
			</PopoverContainer >
		</ClickAwayListener >
	);
};

export default Popover;
