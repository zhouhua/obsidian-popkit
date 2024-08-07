import L from 'src/L';
import type { Action, HandlerParams } from 'src/types';

export const upperCase: Action = {
  id: 'upper-case',
  version: 0,
  name: 'upperCase',
  desc: L.actions.upperCase(),
  test: '.+',
  icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMTUgMTUiPjxwYXRoIGZpbGw9IndoaXRlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zLjYyNiAyLjc1YS41LjUgMCAwIDEgLjQ2OC4zMjdsMy4wNzYgOC4zMmEuNS41IDAgMCAxLS45MzguMzQ2TDUuMjI0IDkuMDE2SDIuMDI3TDEuMDIgMTEuNzQzYS41LjUgMCAxIDEtLjkzOC0uMzQ3bDMuMDc2LTguMzJhLjUuNSAwIDAgMSAuNDY5LS4zMjZtMCAxLjk0Mkw0LjkxIDguMTY2SDIuMzR6bTcuNzQ2LTEuOTQyYS41LjUgMCAwIDEgLjQ2OS4zMjdsMy4wNzUgOC4zMmEuNS41IDAgMSAxLS45MzguMzQ2TDEyLjk3IDkuMDE2SDkuNzczbC0xLjAwOCAyLjcyN2EuNS41IDAgMSAxLS45MzgtLjM0N2wzLjA3Ni04LjMyYS41LjUgMCAwIDEgLjQ2OS0uMzI2bTAgMS45NDJsMS4yODQgMy40NzRoLTIuNTY4eiIgY2xpcC1ydWxlPSJldmVub2RkIi8+PC9zdmc+',
  handler: ({ replace, selection }: HandlerParams) => {
    replace(selection.toUpperCase());
  },
};

export const lowerCase: Action = {
  id: 'lower-case',
  version: 0,
  name: 'lowerCase',
  desc: L.actions.lowerCase(),
  test: '.+',
  icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMTUgMTUiPjxwYXRoIGZpbGw9IndoaXRlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zLjY5OSA1LjIwN2MtMS42NCAwLTIuODkgMS40NzktMi44OSAzLjQwM2MwIDIuMDI0IDEuMzUgMy40MDIgMi44OSAzLjQwMmEzLjA2IDMuMDYgMCAwIDAgMi4yNTUtLjk5di41MDhhLjQ1LjQ1IDAgMCAwIC45IDBWNS43MmEuNDUuNDUgMCAwIDAtLjkgMHYuNTAzYTMuMDEgMy4wMSAwIDAgMC0yLjI1NS0xLjAxNm0yLjI1NSA0LjU5MlY3LjMwMWMtLjM5LS43Mi0xLjIxMy0xLjI0My0yLjA2Ny0xLjI0M2MtLjk3OCAwLTIuMDUyLjkwOC0yLjA1MiAyLjU1MmMwIDEuNTQzLjk3NCAyLjU1MiAyLjA1MiAyLjU1MmMuODgzIDAgMS42ODQtLjY2NiAyLjA2Ny0xLjM2M200Ljg0NS00LjU5MmMtMS42NCAwLTIuODkgMS40NzktMi44OSAzLjQwM2MwIDIuMDI0IDEuMzUgMy40MDIgMi44OSAzLjQwMmEzLjA2IDMuMDYgMCAwIDAgMi4yNTUtLjk5di41MDhhLjQ1LjQ1IDAgMCAwIC45IDBWNS43MmEuNDUuNDUgMCAxIDAtLjkgMHYuNTAzQTMuMDEgMy4wMSAwIDAgMCAxMC44IDUuMjA3bTIuMjU1IDQuNTkxVjcuMzAyYy0uMzktLjcyMS0xLjIxMy0xLjI0NC0yLjA2Ny0xLjI0NGMtLjk3OCAwLTIuMDUyLjkwOC0yLjA1MiAyLjU1MmMwIDEuNTQzLjk3NCAyLjU1MiAyLjA1MiAyLjU1MmMuODgzIDAgMS42ODUtLjY2NyAyLjA2Ny0xLjM2NCIgY2xpcC1ydWxlPSJldmVub2RkIi8+PC9zdmc+',
  handler: ({ replace, selection }: HandlerParams) => {
    replace(selection.toLowerCase());
  },
};

export const capitalCase: Action = {
  id: 'capital-case',
  version: 0,
  name: 'capitalCase',
  desc: L.actions.capitalCase(),
  test: '.+',
  icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMTUgMTUiPjxwYXRoIGZpbGw9IndoaXRlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zLjY5IDIuNzVhLjUuNSAwIDAgMSAuNDY3LjMybDMuMjEgOC4zMmEuNS41IDAgMCAxLS45MzMuMzZMNS4zODMgOS4wMjVIMi4wMUwuOTY3IDExLjc1YS41LjUgMCAwIDEtLjkzNC0uMzU4bDMuMTktOC4zMmEuNS41IDAgMCAxIC40NjctLjMyMW0uMDAyIDEuODkzbDEuMzYzIDMuNTMySDIuMzM3em03LjIwNy41NjRjLTEuNjQgMC0yLjg5IDEuNDc5LTIuODkgMy40MDNjMCAyLjAyNCAxLjM1IDMuNDAyIDIuODkgMy40MDJhMy4wNiAzLjA2IDAgMCAwIDIuMjU1LS45OXYuNTA4YS40NS40NSAwIDEgMCAuOSAwVjUuNzJhLjQ1LjQ1IDAgMCAwLS45IDB2LjUwM0EzLjAxIDMuMDEgMCAwIDAgMTAuOSA1LjIwN20yLjI1NSA0LjU5MVY3LjMwMmMtLjM5LS43MjEtMS4yMTMtMS4yNDQtMi4wNjctMS4yNDRjLS45NzggMC0yLjA1Mi45MDgtMi4wNTIgMi41NTJjMCAxLjU0My45NzQgMi41NTIgMi4wNTIgMi41NTJjLjg4MyAwIDEuNjg1LS42NjcgMi4wNjctMS4zNjQiIGNsaXAtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==',
  handler: ({ replace, selection }: HandlerParams) => {
    const regex = /(\p{L}+['’]\p{L}+|\p{L}+)/gu;
    replace(selection.replace(regex, match => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()));
  },
};
