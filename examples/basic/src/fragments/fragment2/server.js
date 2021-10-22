module.exports = {
  getStaticPaths: async (context) => {

    let paths = [
      { params: { id: 1, locale: 'nl_NL' } },
      { params: { id: 1, locale: 'nl_BE' } },
      { params: { id: 1, locale: 'fr_BE' } },
      { params: { id: 2, locale: 'nl_NL' } },
      { params: { id: 2, locale: 'nl_BE' } },
      { params: { id: 2, locale: 'fr_BE' } },
    ]
    if(context.id){
      paths = paths.filter(path => path.params.id === context.id)
    }
    return {
      paths
    }
  },
  getStaticProps: async (context) => {
    const { id } = context.params
    return {
      props: { id },
    }
  },
  getStaticPathPostfix: (context) => {
    const { id, locale } = context.params
    return `${id}-${locale}`
  }
}
