import type { Action, HandlerParams, IActionWithHandler, PopoverItem } from './types';
import { hasHandler, ItemType } from './types';

export function changeAction(action: Action, type: 'normal' | 'setting', selection?: string) {
  let newAction = { ...action };
  if (type === 'setting') {
    newAction.origin = action;
  }
  else {
    newAction = { ...newAction, ...(action.origin || {}) };
  }
  if (type === 'setting' && action.defaultIcon) {
    newAction.icon = action.defaultIcon;
  }
  if (typeof action.name === 'function') {
    try {
      newAction.name = action.name({ selection });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch (e) {
      newAction.name = '';
    }
  }
  if (typeof action.icon === 'function') {
    try {
      newAction.icon = action.icon({ selection });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch (e) {
      newAction.icon = '';
    }
  }
  return newAction;
}

export async function fileToBase64(file: Blob): Promise<string> {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  return new Promise((resolve, reject) => {
    reader.addEventListener('load', () => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      resolve(reader.result as string);
    });

    reader.onerror = error => {
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      reject(error);
    };
  });
}

export function parseFunction(action: IActionWithHandler) {
  if (typeof action.handler === 'string') {
    return {
      ...action,
      handler: function (params: HandlerParams) {
        // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-call
        return Promise.resolve(new Function(`return (${action.handler as string})`)()(params));
      },
    };
  }
  return action;
}

export function stringifyFunction(action: IActionWithHandler) {
  if (typeof action.handler === 'function') {
    return {
      ...action,
      handler: action.handler.toString(),
    };
  }
  return action;
}

export function updateSettings(allActions: Action[], enabledActions: PopoverItem[], storedKey?: number) {
  const refreshKey = 1;
  const actionMap: Record<string, Action> = {};
  allActions.forEach(action => {
    if (action.id) {
      actionMap[action.id] = action;
    }
  });
  enabledActions.forEach(item => {
    if (
      item.type === ItemType.Action
      && item.action.id
      && item.action.id in actionMap
      && (item.action.version !== actionMap[item.action.id].version
        || refreshKey !== storedKey)
    ) {
      item.action = actionMap[item.action.id];
    }
  });
  return enabledActions.map(item => {
    if (item.type === ItemType.Divider) {
      return {
        ...item,
      };
    }
    const { action } = item;
    if (hasHandler(action)) {
      return {
        ...item,
        action: stringifyFunction(action),
      };
    }
    else {
      return {
        ...item,
      };
    }
  });
}

export interface OrderItemProps<T> {
  origin: T;
  label: string;
  isMatch: boolean;
  markString: string;
}

interface FuzzyResult {
  isMatch: boolean;
  markString: string;
}

function fuzzy(input: string, pattern: string): FuzzyResult {
  if (!pattern) {
    return {
      isMatch: true,
      markString: input,
    };
  }

  const lowerInput = input.toLowerCase();
  const lowerPattern = pattern.toLowerCase();

  let inputIndex = 0;
  let patternIndex = 0;
  const marks: boolean[] = new Array<boolean>(input.length).fill(false);

  // 匹配过程
  while (inputIndex < input.length && patternIndex < pattern.length) {
    if (lowerInput[inputIndex] === lowerPattern[patternIndex]) {
      marks[inputIndex] = true;
      patternIndex++;
    }
    inputIndex++;
  }

  // 生成带标记的字符串
  if (patternIndex === pattern.length) {
    let result = '';
    for (let i = 0; i < input.length; i++) {
      if (marks[i]) {
        result += '<mark>' + input[i] + '</mark>';
      }
      else {
        result += input[i];
      }
    }
    return {
      isMatch: true,
      markString: result,
    };
  }

  return {
    isMatch: false,
    markString: input,
  };
}

export function orderList<T>(
  list: T[],
  inputValue: string,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  getKey: (item: T) => string = (item: T) => (item as string),
): OrderItemProps<T>[] {
  // 当输入为空时，直接返回原列表
  if (!inputValue) {
    return list.map(item => ({
      origin: item,
      label: getKey(item),
      isMatch: true,
      markString: getKey(item),
    }));
  }

  const containsMatchRes: OrderItemProps<T>[] = [];
  const fuzzyMatchRes: OrderItemProps<T>[] = [];
  const noMatchRes: OrderItemProps<T>[] = [];

  const lowerInputValue = inputValue.toLowerCase();

  list.forEach(item => {
    const label = getKey(item);
    const lowerLabel = label.toLowerCase();

    // 先检查是否包含完整匹配词
    if (lowerLabel.includes(lowerInputValue)) {
      // 对于包含匹配的项，创建带高亮的 markString
      let markString = '';
      const index = lowerLabel.indexOf(lowerInputValue);

      markString = label.slice(0, index)
        + '<mark>' + label.slice(index, index + inputValue.length) + '</mark>'
        + label.slice(index + inputValue.length);

      containsMatchRes.push({
        origin: item,
        label,
        isMatch: true,
        markString,
      });
      return; // 提前结束当前项的处理
    }

    // 只对不包含完整匹配词的项进行 fuzzy 匹配
    const fuzzyRes = fuzzy(label, inputValue);
    const orderItem: OrderItemProps<T> = {
      origin: item,
      label,
      isMatch: fuzzyRes.isMatch,
      markString: fuzzyRes.isMatch ? fuzzyRes.markString : label,
    };

    if (fuzzyRes.isMatch) {
      fuzzyMatchRes.push(orderItem);
    }
    else {
      noMatchRes.push(orderItem);
    }
  });

  return [...containsMatchRes, ...fuzzyMatchRes, ...noMatchRes];
}
