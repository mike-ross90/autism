class CustomSuccess {
  constructor(data, message, status) {
    console.log(data, message, status)
    this.data = data
    this.message = message
    this.status = status
  }

  static createSuccess(data, message, status) {
    return new CustomSuccess(data, message, status)
  }

  static ok(data = 'OK') {
    return new CustomSuccess(data, 200)
  }

  static created(data, message = 'Created') {
    return new CustomSuccess(data, message, 201)
  }

  static accepted(data) {
    return new CustomSuccess(data, 202)
  }

  static noContent(data) {
    return new CustomSuccess(data, 204)
  }
}

export default CustomSuccess
