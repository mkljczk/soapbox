/**
 * @category Request params
 */
interface CreateAntennaParams {
  title: string;
  stl?: boolean;
  ltl?: boolean;
  insert_feeds?: boolean;
  with_media_only?: boolean;
  ignore_reblog?: boolean;
  favourite?: boolean;
  list_id?: string;
}

/**
 * @category Request params
 */
type UpdateAntennaParams = Partial<CreateAntennaParams>;

export {
  type CreateAntennaParams,
  type UpdateAntennaParams,
};
