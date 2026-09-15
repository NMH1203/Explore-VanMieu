function PageMarkup({ markup }) {
  return <div dangerouslySetInnerHTML={{ __html: markup }} />
}

export default PageMarkup
