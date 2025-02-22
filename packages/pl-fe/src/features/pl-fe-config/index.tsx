import { create } from 'mutative';
import React, { useState, useEffect, useMemo } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import * as v from 'valibot';

import { updatePlFeConfig } from 'pl-fe/actions/admin';
import { uploadMedia } from 'pl-fe/actions/media';
import List, { ListItem } from 'pl-fe/components/list';
import Accordion from 'pl-fe/components/ui/accordion';
import Button from 'pl-fe/components/ui/button';
import { CardHeader, CardTitle } from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import FileInput from 'pl-fe/components/ui/file-input';
import Form from 'pl-fe/components/ui/form';
import FormActions from 'pl-fe/components/ui/form-actions';
import FormGroup from 'pl-fe/components/ui/form-group';
import Input from 'pl-fe/components/ui/input';
import Streamfield from 'pl-fe/components/ui/streamfield';
import Textarea from 'pl-fe/components/ui/textarea';
import Toggle from 'pl-fe/components/ui/toggle';
import ThemeSelector from 'pl-fe/features/ui/components/theme-selector';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useFeatures } from 'pl-fe/hooks/use-features';
import { cryptoAddressSchema, footerItemSchema, plFeConfigSchema, promoPanelItemSchema, type PlFeConfig } from 'pl-fe/normalizers/pl-fe/pl-fe-config';
import toast from 'pl-fe/toast';

import CryptoAddressInput from './components/crypto-address-input';
import FooterLinkInput from './components/footer-link-input';
import PromoPanelInput from './components/promo-panel-input';
import SitePreview from './components/site-preview';

const messages = defineMessages({
  heading: { id: 'column.plfe_config', defaultMessage: 'Front-end configuration' },
  saved: { id: 'plfe_config.saved', defaultMessage: 'pl-fe config saved!' },
  copyrightFooterLabel: { id: 'plfe_config.copyright_footer.meta_fields.label_placeholder', defaultMessage: 'Copyright footer' },
  cryptoDonatePanelLimitLabel: { id: 'plfe_config.crypto_donate_panel_limit.meta_fields.limit_placeholder', defaultMessage: 'Number of items to display in the crypto homepage widget' },
  rawJSONLabel: { id: 'plfe_config.raw_json_label', defaultMessage: 'Advanced: Edit raw JSON data' },
  rawJSONHint: { id: 'plfe_config.raw_json_hint', defaultMessage: 'Edit the settings data directly. Changes made directly to the JSON file will override the form fields above. Click "Save" to apply your changes.' },
  rawJSONInvalid: { id: 'plfe_config.raw_json_invalid', defaultMessage: 'is invalid' },
  displayFqnLabel: { id: 'plfe_config.display_fqn_label', defaultMessage: 'Display domain (eg @user@domain) for local accounts.' },
  greentextLabel: { id: 'plfe_config.greentext_label', defaultMessage: 'Enable greentext support' },
  authenticatedProfileLabel: { id: 'plfe_config.authenticated_profile_label', defaultMessage: 'Profiles require authentication' },
  authenticatedProfileHint: { id: 'plfe_config.authenticated_profile_hint', defaultMessage: 'Users must be logged-in to view replies and media on user profiles.' },
  displayCtaLabel: { id: 'plfe_config.cta_label', defaultMessage: 'Display call to action panels if not authenticated' },
  mediaPreviewLabel: { id: 'plfe_config.media_preview_label', defaultMessage: 'Prefer preview media for thumbnails' },
  mediaPreviewHint: { id: 'plfe_config.media_preview_hint', defaultMessage: 'Some backends provide an optimized version of media for display in timelines. However, these preview images may be too small without additional configuration.' },
  tileServerLabel: { id: 'plfe_config.tile_server_label', defaultMessage: 'Map tile server' },
  tileServerAttributionLabel: { id: 'plfe_config.tile_server_attribution_label', defaultMessage: 'Map tiles attribution' },
  redirectRootNoLoginLabel: { id: 'plfe_config.redirect_root_no_login_label', defaultMessage: 'Redirect homepage' },
  redirectRootNoLoginHint: { id: 'plfe_config.redirect_root_no_login_hint', defaultMessage: 'Path to redirect the homepage when a user is not logged in.' },
  sentryDsnLabel: { id: 'plfe_config.sentry_dsn_label', defaultMessage: 'Sentry DSN' },
  sentryDsnHint: { id: 'plfe_config.sentry_dsn_hint', defaultMessage: 'DSN URL for error reporting. Works with Sentry and GlitchTip.' },
});

type ValueGetter<T1 = Element, T2 = any> = (e: React.ChangeEvent<T1>) => T2;
type StreamItemConfigPath = ['promoPanel', 'items'] | ['navlinks', 'homeFooter'] | ['cryptoAddresses'];
type ThemeChangeHandler = (theme: string) => void;

const PlFeConfigEditor: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const features = useFeatures();

  const initialData = useAppSelector(state => state.plfe);

  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState(v.parse(plFeConfigSchema, initialData));
  const [jsonEditorExpanded, setJsonEditorExpanded] = useState(false);
  const [rawJSON, setRawJSON] = useState<string>(JSON.stringify(initialData, null, 2));
  const [jsonValid, setJsonValid] = useState(true);

  const plFe = useMemo(() => v.parse(plFeConfigSchema, data), [data]);

  const setConfig = (newData: PlFeConfig) => {
    setData(newData);
    setJsonValid(true);
  };

  const putConfig = (newData: PlFeConfig) => {
    setData(newData);
    setJsonValid(true);
  };

  const handleSubmit: React.FormEventHandler = (e) => {
    dispatch(updatePlFeConfig(data)).then(() => {
      setLoading(false);
      toast.success(intl.formatMessage(messages.saved));
    }).catch(() => {
      setLoading(false);
    });
    setLoading(true);
    e.preventDefault();
  };

  const handleChange = (path: keyof PlFeConfig, getValue: ValueGetter<any, PlFeConfig[typeof path]>): React.ChangeEventHandler => e => {
    const newData: PlFeConfig = { ...data, [path]: getValue(e) };
    setConfig(newData);
  };

  const handleThemeChange: ThemeChangeHandler = (theme) => {
    const newData = create(data, (draft) => {
      if (!draft.defaultSettings) draft.defaultSettings = {};
      draft.defaultSettings.themeMode = theme;
    });
    setConfig(newData);
  };

  const handleFileChange = (path: keyof PlFeConfig): React.ChangeEventHandler<HTMLInputElement> => e => {
    const file = e.target.files?.item(0);

    if (file) {
      dispatch(uploadMedia({ file })).then((data: any) => {
        handleChange(path, () => data.url)(e);
      }).catch(console.error);
    }
  };

  const handleStreamItemChange = (path: StreamItemConfigPath) => (values: any[]) => {
    const newData = create(data, (draft) => {
      if (path[0] === 'cryptoAddresses') {
        draft.cryptoAddresses = values;
      } else {
        // @ts-ignore
        draft[path[0]][path[1]] = values;
      }
    });
    setConfig(newData);
  };

  const addStreamItem = <T, >(path: StreamItemConfigPath, schema: v.BaseSchema<any, T, v.BaseIssue<unknown>>) => () => {
    const newData = create(data, (draft) => {
      if (path[0] === 'cryptoAddresses') {
        draft.cryptoAddresses.push(v.parse(cryptoAddressSchema, {}));
      } else {
        // @ts-ignore
        draft[path[0]][path[1]].push(v.parse(schema, {}));
      }
    });
    setConfig(newData);
  };

  const deleteStreamItem = (path: StreamItemConfigPath) => (i: number) => {
    const newData = create(data, (draft) => {
      if (path[0] === 'cryptoAddresses') {
        draft.cryptoAddresses = draft.cryptoAddresses.filter((_, index) => index !== i);
      } else {
        // @ts-ignore
        draft[path[0]][path[1]] = draft[path[0]][path[1]].filter((_, index) => index !== i);
      }
    });
    setConfig(newData);
  };

  const handleEditJSON: React.ChangeEventHandler<HTMLTextAreaElement> = e => {
    setRawJSON(e.target.value);
  };

  const toggleJSONEditor = (expanded: boolean) => setJsonEditorExpanded(expanded);

  useEffect(() => {
    putConfig(v.parse(plFeConfigSchema, initialData));
  }, [initialData]);

  useEffect(() => {
    setRawJSON(JSON.stringify(data, null, 2));
  }, [data]);

  useEffect(() => {
    try {
      const data = v.parse(plFeConfigSchema, JSON.parse(rawJSON));
      putConfig(data);
    } catch {
      setJsonValid(false);
    }
  }, [rawJSON]);

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form onSubmit={handleSubmit}>
        <fieldset className='space-y-6' disabled={isLoading}>
          <SitePreview plFe={plFe} />

          <FormGroup
            labelText={<FormattedMessage id='plfe_config.fields.logo_label' defaultMessage='Logo' />}
            hintText={<FormattedMessage id='plfe_config.hints.logo' defaultMessage='SVG. At most 2 MB. Will be displayed to 50px height, maintaining aspect ratio' />}
          >
            <FileInput
              onChange={handleFileChange('logo')}
              accept='image/svg+xml,image/png'
            />
          </FormGroup>

          <CardHeader>
            <CardTitle title={<FormattedMessage id='plfe_config.headings.theme' defaultMessage='Theme' />} />
          </CardHeader>

          <List>
            <ListItem label={<FormattedMessage id='plfe_config.fields.theme_label' defaultMessage='Default theme' />}>
              <ThemeSelector
                value={plFe.defaultSettings?.themeMode}
                onChange={handleThemeChange}
              />
            </ListItem>

            <ListItem
              label={<FormattedMessage id='plfe_config.fields.edit_theme_label' defaultMessage='Edit theme' />}
              to='/pl-fe/admin/theme'
            />
          </List>

          <CardHeader>
            <CardTitle title={<FormattedMessage id='plfe_config.headings.options' defaultMessage='Options' />} />
          </CardHeader>

          <List>
            <ListItem label={intl.formatMessage(messages.displayFqnLabel)}>
              <Toggle
                checked={plFe.displayFqn === true}
                onChange={handleChange('displayFqn', (e) => e.target.checked)}
              />
            </ListItem>

            <ListItem label={intl.formatMessage(messages.greentextLabel)}>
              <Toggle
                checked={plFe.greentext === true}
                onChange={handleChange('greentext', (e) => e.target.checked)}
              />
            </ListItem>

            <ListItem
              label={intl.formatMessage(messages.mediaPreviewLabel)}
              hint={intl.formatMessage(messages.mediaPreviewHint)}
            >
              <Toggle
                checked={plFe.mediaPreview === true}
                onChange={handleChange('mediaPreview', (e) => e.target.checked)}
              />
            </ListItem>

            <ListItem label={intl.formatMessage(messages.displayCtaLabel)}>
              <Toggle
                checked={plFe.displayCta === true}
                onChange={handleChange('displayCta', (e) => e.target.checked)}
              />
            </ListItem>

            <ListItem
              label={intl.formatMessage(messages.authenticatedProfileLabel)}
              hint={intl.formatMessage(messages.authenticatedProfileHint)}
            >
              <Toggle
                checked={plFe.authenticatedProfile === true}
                onChange={handleChange('authenticatedProfile', (e) => e.target.checked)}
              />
            </ListItem>

            <ListItem
              label={intl.formatMessage(messages.redirectRootNoLoginLabel)}
              hint={intl.formatMessage(messages.redirectRootNoLoginHint)}
            >
              <Input
                type='text'
                placeholder='/timeline/local'
                value={String(data.redirectRootNoLogin || '')}
                onChange={handleChange('redirectRootNoLogin', (e) => e.target.value)}
              />
            </ListItem>

            <ListItem
              label={intl.formatMessage(messages.sentryDsnLabel)}
              hint={intl.formatMessage(messages.sentryDsnHint)}
            >
              <Input
                type='text'
                placeholder='https://01234abcdef@glitch.tip.tld/5678'
                value={String(data.sentryDsn ||  '')}
                onChange={handleChange('sentryDsn', (e) => e.target.value)}
              />
            </ListItem>
          </List>

          <CardHeader>
            <CardTitle title={<FormattedMessage id='plfe_config.headings.navigation' defaultMessage='Navigation' />} />
          </CardHeader>

          <Streamfield
            label={<FormattedMessage id='plfe_config.fields.promo_panel_fields_label' defaultMessage='Promo panel items' />}
            hint={<FormattedMessage id='plfe_config.hints.promo_panel_fields' defaultMessage='You can have custom defined links displayed on the right panel of the timelines page.' />}
            component={PromoPanelInput}
            values={plFe.promoPanel.items}
            onChange={handleStreamItemChange(['promoPanel', 'items'])}
            onAddItem={addStreamItem(['promoPanel', 'items'], promoPanelItemSchema)}
            onRemoveItem={deleteStreamItem(['promoPanel', 'items'])}
            draggable
          />

          <Streamfield
            label={<FormattedMessage id='plfe_config.fields.home_footer_fields_label' defaultMessage='Home footer items' />}
            hint={<FormattedMessage id='plfe_config.hints.home_footer_fields' defaultMessage='You can have custom defined links displayed on the footer of your static pages' />}
            component={FooterLinkInput}
            values={plFe.navlinks.homeFooter || []}
            onChange={handleStreamItemChange(['navlinks', 'homeFooter'])}
            onAddItem={addStreamItem(['navlinks', 'homeFooter'], footerItemSchema)}
            onRemoveItem={deleteStreamItem(['navlinks', 'homeFooter'])}
            draggable
          />

          <FormGroup labelText={intl.formatMessage(messages.copyrightFooterLabel)}>
            <Input
              type='text'
              placeholder={intl.formatMessage(messages.copyrightFooterLabel)}
              value={plFe.copyright}
              onChange={handleChange('copyright', (e) => e.target.value)}
            />
          </FormGroup>

          {features.events && (
            <>
              <CardHeader>
                <CardTitle title={<FormattedMessage id='plfe_config.headings.events' defaultMessage='Events' />} />
              </CardHeader>

              <FormGroup labelText={intl.formatMessage(messages.tileServerLabel)}>
                <Input
                  type='text'
                  placeholder={intl.formatMessage(messages.tileServerLabel)}
                  value={plFe.tileServer}
                  onChange={handleChange('tileServer', (e) => e.target.value)}
                />
              </FormGroup>

              <FormGroup labelText={intl.formatMessage(messages.tileServerAttributionLabel)}>
                <Input
                  type='text'
                  placeholder={intl.formatMessage(messages.tileServerAttributionLabel)}
                  value={plFe.tileServerAttribution}
                  onChange={handleChange('tileServerAttribution', (e) => e.target.value)}
                />
              </FormGroup>
            </>
          )}

          <CardHeader>
            <CardTitle title={<FormattedMessage id='plfe_config.headings.cryptocurrency' defaultMessage='Cryptocurrency' />} />
          </CardHeader>

          <Streamfield
            label={<FormattedMessage id='plfe_config.fields.crypto_addresses_label' defaultMessage='Cryptocurrency addresses' />}
            hint={<FormattedMessage id='plfe_config.hints.crypto_addresses' defaultMessage='Add cryptocurrency addresses so users of your site can donate to you. Order matters, and you must use lowercase ticker values.' />}
            component={CryptoAddressInput}
            values={plFe.cryptoAddresses}
            onChange={handleStreamItemChange(['cryptoAddresses'])}
            onAddItem={addStreamItem(['cryptoAddresses'], cryptoAddressSchema)}
            onRemoveItem={deleteStreamItem(['cryptoAddresses'])}
            draggable
          />

          <FormGroup labelText={intl.formatMessage(messages.cryptoDonatePanelLimitLabel)}>
            <Input
              type='number'
              min={0}
              pattern='[0-9]+'
              placeholder={intl.formatMessage(messages.cryptoDonatePanelLimitLabel)}
              value={plFe.cryptoDonatePanel.limit}
              onChange={handleChange('cryptoDonatePanel', (e) => ({ limit: Number(e.target.value) }))}
            />
          </FormGroup>

          <CardHeader>
            <CardTitle title={<FormattedMessage id='plfe_config.headings.advanced' defaultMessage='Advanced' />} />
          </CardHeader>

          <Accordion
            headline={intl.formatMessage(messages.rawJSONLabel)}
            expanded={jsonEditorExpanded}
            onToggle={toggleJSONEditor}
          >
            <FormGroup
              hintText={intl.formatMessage(messages.rawJSONHint)}
              errors={jsonValid ? undefined : [intl.formatMessage(messages.rawJSONInvalid)]}
            >
              <Textarea
                value={rawJSON}
                onChange={handleEditJSON}
                isCodeEditor
                rows={12}
              />
            </FormGroup>
          </Accordion>
        </fieldset>

        <FormActions>
          <Button type='submit'>
            <FormattedMessage id='plfe_config.save' defaultMessage='Save' />
          </Button>
        </FormActions>
      </Form>
    </Column>
  );
};

export { PlFeConfigEditor as default };
